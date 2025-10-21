#!/usr/bin/env python3
"""
プライベート版データ作成スクリプト（バッチ処理対応版）
Gemini APIでタイトル・カテゴリーを生成し、元本文を保持
"""

import argparse
import json
import os
import sys
import time
import uuid
from datetime import datetime
from typing import List, Optional, Dict

import requests
from dotenv import load_dotenv

# .envファイルを読み込み
load_dotenv()

# --- 設定 ---
DEFAULT_GEMINI_API_KEY = ""  # 環境変数 GEMINI_API_KEY を使用してください
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

INPUT_PATH = "data/raw_emails.json"
OUTPUT_PATH = "data/articles-private.json"

BATCH_SIZE = 50  # 1回のリクエストで処理するメール数
API_RETRY_COUNT = 3
MAX_BODY_CHARS = 2000  # 1メールあたりの最大文字数（トークン数考慮）
REQUEST_TIMEOUT = 300  # バッチ処理のためタイムアウトを延長

# --- プロンプトテンプレート ---
BATCH_PROMPT_TEMPLATE = """以下のメール本文リスト（JSON形式）を分析し、各メールに対してタイトルとカテゴリーを提案してください。

【タスク】
- 各メールの本文を読んで、内容を理解する。
- タイトル: 30文字以内で内容を表すタイトルを生成する。
- カテゴリー: 次のリストから最も適切なものを1つ選択する（自己受容, 目標設定, 習慣形成, マインドセット, 人間関係, 感謝, 行動力）。

【入力形式】
- メール本文のリストがJSON形式で与えられます。各オブジェクトは `id` と `body` を持ちます。

【出力形式】
- **必ず、入力に対応するJSON配列のみを出力してください。**
- 各オブジェクトには `id`, `title`, `category` を含めてください。
- 説明や前置き、```json ... ```のようなマークダウンは一切含めないでください。

【例】
入力:
[
  {{ "id": 1, "body": "..." }},
  {{ "id": 2, "body": "..." }}
]

期待する出力:
[
  {{ "id": 1, "title": "感謝の気持ちを伝える重要性", "category": "感謝" }},
  {{ "id": 2, "title": "新しい目標設定の方法", "category": "目標設定" }}
]

【メール本文リスト】
{emails_json}
"""

# --- 関数定義 ---

def parse_args() -> argparse.Namespace:
    """コマンドライン引数を解釈"""
    parser = argparse.ArgumentParser(description="Geminiバッチ生成スクリプト")
    parser.add_argument("--input", default=INPUT_PATH, help="入力メールJSONのパス")
    parser.add_argument("--output", default=OUTPUT_PATH, help="出力JSONのパス")
    parser.add_argument("--limit", type=int, default=None, help="テスト用に処理件数を制限")
    parser.add_argument("--no-resume", action="store_true", help="既存の出力を無視して最初から実行")
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

def save_articles(path: str, articles: List[dict]) -> None:
    """記事データを書き出し"""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

def prepare_body(body: str) -> str:
    """Geminiに渡す本文を最大長に切り詰め"""
    return body[:MAX_BODY_CHARS] if len(body) > MAX_BODY_CHARS else body

def call_gemini_batch(api_key: str, batch_emails: List[Dict]) -> Optional[List[Dict]]:
    """Gemini APIをバッチで呼び出し、結果をパースして返す"""

    # バッチ処理用のプロンプトを作成
    emails_json = json.dumps([
        {"id": i, "body": prepare_body(email.get("body", ""))}
        for i, email in enumerate(batch_emails)
    ], ensure_ascii=False)

    prompt = BATCH_PROMPT_TEMPLATE.format(emails_json=emails_json)

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
            if 'result' in locals() and 'candidates' in result:
                 print(f"  受け取ったテキスト: {result['candidates'][0]['content']['parts'][0]['text']}")


        if attempt < API_RETRY_COUNT - 1:
            wait = 2 ** attempt
            print(f"  {wait}秒待機してリトライします...")
            time.sleep(wait)

    return None

def parse_email_date(date_str: str) -> str:
    """メール日付をYYYY-MM-DD形式に変換"""
    try:
        normalized = date_str.split("(")[0].strip()
        dt = datetime.strptime(normalized, "%a, %d %b %Y %H:%M:%S %z")
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return datetime.now().strftime("%Y-%m-%d")

def build_article(email: dict, title: str, category: str) -> dict:
    """記事データの辞書構築"""
    date = parse_email_date(email.get("date", ""))
    safe_title = title[:50] if title else "タイトルなし"
    return {
        "id": str(uuid.uuid4()),
        "title": safe_title,
        "content": email.get("body", ""),
        "category": category or "未分類",
        "date": date,
        "originalDate": email.get("date", ""),
        "createdAt": datetime.now().isoformat(),
        "tags": [category, "メンタル"] if category else ["メンタル"],
    }

def main():
    """メイン処理"""
    args = parse_args()

    if not os.path.exists(args.input):
        print(f"エラー: {args.input} が見つかりません")
        sys.exit(1)

    emails = load_json(args.input)
    if args.limit is not None:
        emails = emails[:args.limit]

    total_count = len(emails)
    if total_count == 0:
        print("処理対象のメールがありません")
        return

    existing_articles: List[dict] = []
    if not args.no_resume and os.path.exists(args.output):
        try:
            existing_articles = load_json(args.output)
        except Exception as e:
            print(f"  既存ファイルの読み込みに失敗: {e}。新規で作り直します")

    processed_bodies = {article.get('content') for article in existing_articles}
    remaining_emails = [email for email in emails if email.get('body') not in processed_bodies]

    processed_count = total_count - len(remaining_emails)

    if not remaining_emails:
        print(f"既に {processed_count}/{total_count} 件処理済みです。追加処理はありません")
        return

    api_key = get_api_key()
    articles = existing_articles

    print(f"処理開始: 残り{len(remaining_emails)}件のメールを{BATCH_SIZE}件ずつのバッチで処理します")

    for i in range(0, len(remaining_emails), BATCH_SIZE):
        batch_emails = remaining_emails[i:i + BATCH_SIZE]
        start_index = processed_count + i

        print(f"\n[{start_index + 1}-{start_index + len(batch_emails)}/{total_count}] バッチ処理中...")

        results = call_gemini_batch(api_key, batch_emails)

        if not results:
            print("  このバッチの処理に失敗しました。スキップします。")
            continue

        for res in results:
            try:
                original_email_index = res['id']
                original_email = batch_emails[original_email_index]

                title = res.get("title", original_email.get("subject", "タイトル未設定"))
                category = res.get("category", "マインドセット")

                article = build_article(original_email, title, category)
                articles.append(article)

                print(f"  ✓ {article['title']} ({category})")

            except (IndexError, KeyError) as e:
                print(f"  結果の処理中にエラー: {e} - スキップします")
                continue

        save_articles(args.output, articles)
        print(f"  進捗保存: {len(articles)}件を書き出しました")

        time.sleep(1)

    print(f"\n完了: {len(articles)}件の記事を {args.output} に保存しました")

    categories: dict = {}
    for article in articles:
        cat = article["category"]
        categories[cat] = categories.get(cat, 0) + 1

    print("\nカテゴリー別統計:")
    for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"  {cat}: {count}件")


if __name__ == "__main__":
    main()
