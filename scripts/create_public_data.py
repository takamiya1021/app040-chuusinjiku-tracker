#!/usr/bin/env python3
"""
パブリック版データ作成スクリプト
Gemini API（gemini-2.5-flash）で1,000〜3,000文字に要約
"""

import argparse
import json
import os
import sys
import time
from typing import List, Optional

import requests
from dotenv import load_dotenv

# .envファイルを読み込み
load_dotenv()

# --- 設定 ---
DEFAULT_GEMINI_API_KEY = ""  # 環境変数 GEMINI_API_KEY を使用してください
GEMINI_MODEL = "gemini-2.5-pro"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

INPUT_PATH = "data/articles-private.json"
OUTPUT_PATH = "data/articles-public.json"

API_RETRY_COUNT = 3
REQUEST_TIMEOUT = 60

# --- プロンプトテンプレート ---
SUMMARY_PROMPT_TEMPLATE = """以下のメール本文を、筆者本人の視点（一人称）を保ちながら、700文字程度に要約してください。

【要約条件】
- 筆者本人の一人称（僕、私など）で書く
- ブログのように適度に改行を入れて読みやすくする
- 700文字程度

【出力形式（JSON）】
{{
  "title": "[タイトル（30文字以内）]",
  "category": "[カテゴリー（自己受容、目標設定、習慣形成、マインドセット、人間関係、感謝、行動力のいずれか）]",
  "content": "[要約（改行を含むブログ形式、700文字程度、筆者本人の一人称で）]"
}}

【メール本文】
{content}
"""

# --- 関数定義 ---

def parse_args() -> argparse.Namespace:
    """コマンドライン引数を解釈"""
    parser = argparse.ArgumentParser(description="パブリック版データ作成スクリプト")
    parser.add_argument("--input", default=INPUT_PATH, help="入力データ（プライベート版JSON）")
    parser.add_argument("--output", default=OUTPUT_PATH, help="出力データ（パブリック版JSON）")
    parser.add_argument("--limit", type=int, default=None, help="処理件数制限（テスト用）")
    parser.add_argument("--test", action="store_true", help="1件のみテスト実行")
    return parser.parse_args()

def get_api_key() -> str:
    """環境変数優先でAPIキーを取得"""
    key = os.environ.get("GEMINI_API_KEY", DEFAULT_GEMINI_API_KEY).strip()
    if not key:
        print("エラー: Gemini APIキーが設定されていません。環境変数 GEMINI_API_KEY を設定してください。")
        sys.exit(1)
    return key

def load_json(path: str) -> List[dict]:
    """JSON配列ファイルを読み込む"""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        if not isinstance(data, list):
            raise ValueError(f"{path} は配列形式ではありません")
        return data

def save_json(path: str, data: List[dict]) -> None:
    """JSON配列を書き出し"""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def call_gemini_api(api_key: str, content: str) -> Optional[dict]:
    """Gemini APIを呼び出して要約を取得"""

    prompt = SUMMARY_PROMPT_TEMPLATE.format(content=content)

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
        }
    }

    for attempt in range(API_RETRY_COUNT):
        try:
            response = requests.post(
                f"{GEMINI_API_URL}?key={api_key}",
                headers=headers,
                json=payload,
                timeout=REQUEST_TIMEOUT
            )

            if response.status_code == 200:
                result = response.json()
                text_content = result['candidates'][0]['content']['parts'][0]['text']
                return json.loads(text_content)
            else:
                print(f"  APIエラー: Status {response.status_code}, Response: {response.text}")

        except requests.RequestException as e:
            print(f"  リクエストエラー: {e}")
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            print(f"  レスポンス解析エラー: {e}")
            if 'result' in locals():
                print(f"  受け取ったレスポンス: {result}")

        if attempt < API_RETRY_COUNT - 1:
            wait = 2 ** attempt
            print(f"  {wait}秒待機してリトライします...")
            time.sleep(wait)

    return None

def main():
    """メイン処理"""
    args = parse_args()

    if not os.path.exists(args.input):
        print(f"エラー: {args.input} が見つかりません")
        sys.exit(1)

    # プライベート版データを読み込み
    private_articles = load_json(args.input)

    # テストモードまたは件数制限
    if args.test:
        private_articles = private_articles[:1]
        print("🧪 テストモード: 1件のみ処理します\n")
    elif args.limit is not None:
        private_articles = private_articles[:args.limit]
        print(f"処理件数を{args.limit}件に制限します\n")

    api_key = get_api_key()
    public_articles = []

    total = len(private_articles)
    print(f"処理開始: {total}件の記事を要約します\n")

    for i, article in enumerate(private_articles, 1):
        print(f"[{i}/{total}] 処理中: {article.get('title', '無題')[:30]}...")

        # Gemini APIで要約取得
        result = call_gemini_api(api_key, article['content'])

        if not result:
            print(f"  ❌ スキップ: API呼び出し失敗")
            continue

        # パブリック版記事を作成（プライベート版と同じIDを使用）
        public_article = {
            "id": article["id"],
            "title": result.get("title", article["title"])[:50],
            "content": result.get("content", ""),
            "category": result.get("category", article.get("category", "未分類")),
            "date": article["date"],
            "originalDate": article.get("originalDate", article["date"]),
            "createdAt": article["createdAt"],
            "tags": [result.get("category", "メンタル"), "メンタル"]
        }

        # 文字数チェック
        content_len = len(public_article["content"])
        if content_len <= 700:
            print(f"  ✅ 完了: {public_article['title']} ({content_len}文字)")
        else:
            print(f"  ⚠️  警告: {public_article['title']} ({content_len}文字 - 700文字超過)")

        public_articles.append(public_article)

        # API制限対策（1秒待機）
        if i < total:
            time.sleep(1)

    # 結果を保存
    save_json(args.output, public_articles)

    print(f"\n✅ 完了: {len(public_articles)}件の記事を {args.output} に保存しました")

    # 統計情報
    char_counts = [len(a["content"]) for a in public_articles]
    if char_counts:
        avg_chars = sum(char_counts) / len(char_counts)
        in_range = sum(1 for c in char_counts if c <= 700)
        print(f"\n📊 統計:")
        print(f"  平均文字数: {avg_chars:.0f}文字")
        print(f"  700文字以内: {in_range}/{len(public_articles)}件 ({in_range/len(public_articles)*100:.1f}%)")

if __name__ == "__main__":
    main()
