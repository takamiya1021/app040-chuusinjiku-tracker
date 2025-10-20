#!/bin/bash
set -e

echo "=== 記事要約処理開始 ==="
echo "総記事数: 899件"
echo "バッチ数: 18回"
echo

for i in {1..17}; do
    echo "Batch $((i+1))/18 を処理中..."
    python3 scripts/summarize_batch.py public/articles-visible.json public/batch-$i.json $i
    echo
done

echo "=== 全バッチ完了 ==="
echo

# 全バッチを結合
echo "全バッチを結合中..."
python3 << 'PYTHON'
import json

all_articles = []
for i in range(18):
    with open(f'public/batch-{i}.json', 'r', encoding='utf-8') as f:
        batch = json.load(f)
        all_articles.extend(batch)

print(f"合計 {len(all_articles)} 件の記事を結合しました")

# articles-summary.jsonとして保存
with open('public/articles-summary.json', 'w', encoding='utf-8') as f:
    json.dump(all_articles, f, ensure_ascii=False, indent=2)

print("保存完了: public/articles-summary.json")
PYTHON

echo "=== 処理完了 ==="
