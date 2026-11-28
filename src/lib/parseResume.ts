/**
 * 简历文件解析：PDF / DOCX / 纯文本 / 图片（OCR）
 *
 * 原则：
 * - 全部在浏览器本地完成，**不上传任何文件**
 * - 重库（pdfjs / mammoth / tesseract）按需动态加载，不进主包
 * - 解析结果一律交给用户核对后再用——解析永远可能出错
 */

export type ParseMethod = 'pdf' | 'docx' | 'text' | 'ocr'

export interface ParseResult {
  text: string
  method: ParseMethod
  /** OCR 额外信息 */
  confidence?: number
  warnings: string[]
}

export const ACCEPT = '.pdf,.doc,.docx,.txt,.md,.rtf,image/png,image/jpeg,image/webp'

const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'webp', 'bmp']

export function extOf(name: string) {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}

export function kindOf(file: File): ParseMethod | null {
  const ext = extOf(file.name)
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx' || ext === 'doc') return 'docx'
  if (ext === 'txt' || ext === 'md' || ext === 'rtf') return 'text'
  if (IMAGE_EXT.includes(ext) || file.type.startsWith('image/')) return 'ocr'
  return null
}

/** 文本清洗：去掉 PDF 常见的软换行、多余空白 */
function tidy(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
}

async function parsePdf(file: File, onProgress?: (m: string) => void): Promise<ParseResult> {
  onProgress?.('加载 PDF 解析器…')
  const pdfjs = await import('pdfjs-dist')
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')

  pdfjs.GlobalWorkerOptions.workerSrc = worker.default

  const buf = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buf }).promise
  const warnings: string[] = []
  const parts: string[] = []

  onProgress?.(`解析中 · 共 ${doc.numPages} 页`)
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    const line = content.items
      .map((it) => ('str' in it ? (it as { str: string }).str : ''))
      .join(' ')
    parts.push(line)
    onProgress?.(`解析中 · ${p}/${doc.numPages} 页`)
  }

  const text = tidy(parts.join('\n\n'))
  if (text.length < 30) {
    warnings.push(
      '这份 PDF 几乎没有可提取的文字，可能是扫描件或截图。建议改用图片识别，或直接粘贴文本。',
    )
  }
  return { text, method: 'pdf', warnings }
}

async function parseDocx(file: File, onProgress?: (m: string) => void): Promise<ParseResult> {
  onProgress?.('加载 Word 解析器…')
  const mammoth = await import('mammoth/mammoth.browser.js')
  const buf = await file.arrayBuffer()
  onProgress?.('解析中…')
  const out = await mammoth.extractRawText({ arrayBuffer: buf })
  const warnings: string[] = []
  if (/\.doc$/i.test(file.name)) {
    warnings.push('旧版 .doc 格式支持有限，若结果为空请另存为 .docx 或粘贴文本。')
  }
  return { text: tidy(out.value), method: 'docx', warnings }
}

async function parseText(file: File): Promise<ParseResult> {
  const text = tidy(await file.text())
  return { text, method: 'text', warnings: [] }
}

async function parseImage(
  file: File,
  onProgress?: (m: string) => void,
): Promise<ParseResult> {
  onProgress?.('加载中文识别模型（本地 1.6 MB，已随站点打包）…')
  const { createWorker } = await import('tesseract.js')

  // 语言包放在 public/tessdata，随站点一起发布——现场断网也能识别
  const langPath = new URL('tessdata/', document.baseURI).href

  const worker = await createWorker('chi_sim+eng', 1, {
    langPath,
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') {
        onProgress?.(`识别中 · ${Math.round(m.progress * 100)}%`)
      }
    },
  })

  try {
    const { data } = await worker.recognize(file)
    const warnings: string[] = []
    const text = tidy(data.text ?? '')
    if ((data.confidence ?? 0) < 70) {
      warnings.push(
        `识别置信度只有 ${Math.round(data.confidence ?? 0)}%，结果可能不准，请逐行核对后再用。`,
      )
    }
    if (text.length < 30) {
      warnings.push('几乎没有识别出文字。建议换一张更清晰、正着拍的图片，或直接粘贴文本。')
    }
    return { text, method: 'ocr', confidence: data.confidence, warnings }
  } finally {
    await worker.terminate()
  }
}

export async function parseResumeFile(
  file: File,
  onProgress?: (m: string) => void,
): Promise<ParseResult> {
  const kind = kindOf(file)
  if (!kind) {
    throw new Error('不支持这个格式。可以上传 PDF、Word(.docx)、纯文本，或简历截图。')
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('文件超过 20 MB，请先压缩或改传截图。')
  }

  switch (kind) {
    case 'pdf':
      return parsePdf(file, onProgress)
    case 'docx':
      return parseDocx(file, onProgress)
    case 'text':
      return parseText(file)
    case 'ocr':
      return parseImage(file, onProgress)
  }
}
