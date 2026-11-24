# -*- coding: utf-8 -*-
"""
AHP 权重计算

用法
----
1) 让 1–2 位 HR 打开 docs/ahp/问卷.html 填写，点「导出 JSON」，得到 hr01.json / hr02.json
2) 把 json 放到本目录，然后运行：

       python ahp.py hr01.json hr02.json

   输出：每位专家各自的权重与一致性比率 CR、两人的合并权重（判断矩阵取几何平均），
   以及一段可直接粘进源码的 TypeScript 常量。

3) 只想验证脚本是否正常： python ahp.py --self-test

说明
----
- 判断矩阵由「问卷」页生成，a[i][j] 表示维度 i 相对维度 j 的重要程度（1–9，倒数表示反向）
- 权重 = 最大特征值对应的特征向量（归一化后）
- CI = (λmax - n) / (n - 1)，CR = CI / RI；CR < 0.1 视为判断自洽
"""
import json
import sys

import numpy as np

RI = {1: 0.0, 2: 0.0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}


def eigen(matrix):
    """返回 (归一化权重, λmax)"""
    m = np.asarray(matrix, dtype=float)
    vals, vecs = np.linalg.eig(m)
    k = int(np.argmax(vals.real))
    lam = float(vals[k].real)
    w = np.abs(vecs[:, k].real)
    w = w / w.sum()
    return w, lam


def consistency(matrix):
    w, lam = eigen(matrix)
    n = len(matrix)
    ci = (lam - n) / (n - 1) if n > 1 else 0.0
    cr = ci / RI.get(n, 1.49) if RI.get(n) else 0.0
    return w, lam, ci, cr


def report(name, dims, matrix):
    w, lam, ci, cr = consistency(matrix)
    print(f"\n=== {name} ===")
    for d, v in zip(dims, w):
        print(f"  {d:<10} {v * 100:6.2f}%")
    flag = "通过" if cr < 0.1 else "未通过（判断存在矛盾，建议复核）"
    print(f"  λmax = {lam:.4f}   CI = {ci:.4f}   n = {len(matrix)}   CR = {cr:.4f}  → {flag}")
    return w, cr


def geometric_mean(matrices):
    """多位专家的判断矩阵取几何平均后合并"""
    logs = [np.log(np.asarray(m, dtype=float)) for m in matrices]
    return np.exp(np.mean(logs, axis=0))


def emit_ts(dims, weights):
    print("\n--- 可粘进 src/data/ahpWeights.ts ---\n")
    print("export const AHP_WEIGHTS: Record<string, number> = {")
    for d, v in zip(dims, weights):
        print(f"  {d}: {v:.4f},")
    print("}")


def self_test():
    """用一个已知一致性的矩阵验证算法"""
    # 完全一致的判断矩阵：w = (0.5, 0.3, 0.2)，CR 应为 0
    w0 = np.array([0.5, 0.3, 0.2])
    m = np.array([[w0[i] / w0[j] for j in range(3)] for i in range(3)])
    w, lam, ci, cr = consistency(m)
    print("已知权重:", np.round(w0, 4))
    print("计算权重:", np.round(w, 4))
    print(f"λmax={lam:.4f} CI={ci:.6f} CR={cr:.6f}")
    ok = np.allclose(w, w0, atol=1e-6) and abs(cr) < 1e-6
    print("结果:", "通过" if ok else "失败")
    return 0 if ok else 1


def main(argv):
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    if argv[0] == "--self-test":
        return self_test()

    experts = []
    for path in argv:
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        experts.append(d)

    dims = experts[0]["dims"]
    if len({tuple(e["dims"]) for e in experts}) != 1:
        print("错误：各文件的维度列表不一致")
        return 1

    results = []
    for e in experts:
        w, cr = report(e.get("expert", "未命名"), dims, e["matrix"])
        results.append((e, w, cr))

    bad = [r for r in results if r[2] >= 0.1]
    if bad:
        print("\n注意：上列 CR ≥ 0.1 的判断矩阵不建议直接使用，先请该专家复核。")

    if len(experts) > 1:
        merged = geometric_mean([e["matrix"] for e in experts])
        w, cr = report(f"合并（{len(experts)} 位专家，判断矩阵几何平均）", dims, merged)
        emit_ts(dims, w)
    else:
        emit_ts(dims, results[0][1])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
