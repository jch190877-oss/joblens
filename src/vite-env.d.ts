/// <reference types="vite/client" />

// mammoth 只发布了浏览器构建产物，没有类型声明
declare module 'mammoth/mammoth.browser.js' {
  export interface MammothResult {
    value: string
    messages: unknown[]
  }
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>
  const mammoth: { extractRawText: typeof extractRawText }
  export default mammoth
}
