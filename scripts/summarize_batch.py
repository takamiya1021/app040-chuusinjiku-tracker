#!/usr/bin/env python3
import json
import sys
import time
import subprocess

def summarize_with_gemini(content, title):
    """Geminiを使って記事を要約"""
    prompt = f"""以下の記事を300-400文字程度に要約してください。
要約は元の内容を変えず、重要なポイントを簡潔にまとめてください。
スマホで縦2ページ、PCでスクロール不要な長さを目指してください。

タイトル: {title}

本文:
{content}

要約:"""
    
    try:
        # Gemini CLIを使用
        result = subprocess.run(
            ['gemini', '-m', 'gemini-2.0-flash-exp'],
            input=prompt,
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=60
        )
        
        if result.returncode == 0:
            summary = result.stdout.strip()
            return summary if summary else content[:400]
        else:
            print(f"Gemini error: {result.stderr}", file=sys.stderr)
            return content[:400]
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return content[:400]

def main():
    if len(sys.argv) != 4:
        print("Usage: summarize_batch.py <input.json> <output.json> <batch_num>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    batch_num = int(sys.argv[3])
    
    # 記事を読み込む
    with open(input_file, 'r', encoding='utf-8') as f:
        articles = json.load(f)
    
    # バッチ範囲を計算
    start_idx = batch_num * 50
    end_idx = min(start_idx + 50, len(articles))
    batch_articles = articles[start_idx:end_idx]
    
    print(f"Batch {batch_num + 1}: 記事 {start_idx + 1} ~ {end_idx} を処理中...")
    
    # 要約処理
    for i, article in enumerate(batch_articles, start=start_idx + 1):
        print(f"  [{i}/{len(articles)}] {article['title'][:40]}...", end=' ', flush=True)
        
        summary = summarize_with_gemini(article['content'], article['title'])
        article['content'] = summary
        
        print(f"✓ ({len(summary)}文字)")
        
        # レート制限対策
        if i % 10 == 0:
            time.sleep(2)
        else:
            time.sleep(0.5)
    
    # 結果を保存
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(batch_articles, f, ensure_ascii=False, indent=2)
    
    print(f"Batch {batch_num + 1} 完了: {output_file}")

if __name__ == '__main__':
    main()
