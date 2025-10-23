#!/usr/bin/env python3
"""
パブリック版データ作成スクリプト（バッチ処理版）
Gemini API（gemini-2.5-pro）で700文字程度に要約
"""

import argparse
import json
import os
import sys
import time
from typing import List, Optional, Dict

import requests
from dotenv import load_dotenv

# .envファイルを読み込み
load_dotenv()

# --- 設定 ---
DEFAULT_GEMINI_API_KEY = ""  # 環境変数 GEMINI_API_KEY を使用してください
GEMINI_MODEL = "gemini-2.5-pro"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

INPUT_PATH = "data/input.json"
OUTPUT_PATH = "public/short.json"

BATCH_SIZE = 20  # 1回のリクエストで処理する記事数（TPM制限考慮: 20件×1000トークン+500=20,500トークン/リクエスト）
API_RETRY_COUNT = 3
MAX_BODY_CHARS = 100000  # 1記事あたりの最大文字数（制限なし・全文送信）
REQUEST_TIMEOUT = 300  # バッチ処理のためタイムアウトを延長
SLEEP_SECONDS = 15  # API制限対応: 無料版RPM=5 → 60秒÷5=12秒+処理時間考慮=15秒（安全マージン）

# --- プロンプトテンプレート ---
BATCH_PROMPT_TEMPLATE = """以下の記事リスト（JSON形式）を分析し、各記事を要約してください。

【タスク】
- 各記事の本文を読んで、内容を理解する。
- タイトル: 30文字以内で内容を表すタイトルを生成する。
- カテゴリー: 次のリストから最も適切なものを1つ選択する（自己受容, 目標設定, 習慣形成, マインドセット, 人間関係, 感謝, 行動力）。
- 本文: 以下のルールに従って処理する。
  ・元の本文が500文字未満の場合: そのまま保持する（要約不要）
  ・元の本文が500文字以上の場合: 筆者本人の視点（一人称）を保ちながら、必ず700文字以下に要約する
  ・ブログのように適度に改行を入れて読みやすくする

【入力形式】
- 記事リストがJSON形式で与えられます。各オブジェクトは `id` と `content` を持ちます。

【出力形式】
- **必ず、入力に対応するJSON配列のみを出力してください。**
- 各オブジェクトには `id`, `title`, `category`, `content` を含めてください。
- 説明や前置き、```json ... ```のようなマークダウンは一切含めないでください。

【例】
入力:
[
  {{ "id": 0, "content": "..." }},
  {{ "id": 1, "content": "..." }}
]

期待する出力:
[
  {{ "id": 0, "title": "感謝の気持ちを伝える重要性", "category": "感謝", "content": "要約された本文..." }},
  {{ "id": 1, "title": "新しい目標設定の方法", "category": "目標設定", "content": "要約された本文..." }}
]

【記事リスト】
{articles_json}
"""

# --- 関数定義 ---

def parse_args() -> argparse.Namespace:
    """コマンドライン引数を解釈"""
    parser = argparse.ArgumentParser(description="パブリック版データ作成スクリプト（バッチ処理版）")
    parser.add_argument("--input", default=INPUT_PATH, help="入力データ（プライベート版JSON）")
    parser.add_argument("--output", default=OUTPUT_PATH, help="出力データ（パブリック版JSON）")
    parser.add_argument("--limit", type=int, default=None, help="処理件数制限（テスト用）")
    parser.add_argument("--test", action="store_true", help="1バッチ（20件）のみテスト実行")
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

def prepare_content(content: str) -> str:
    """Geminiに渡す本文を最大長に切り詰め"""
    return content[:MAX_BODY_CHARS] if len(content) > MAX_BODY_CHARS else content

def call_gemini_batch(api_key: str, batch_articles: List[Dict]) -> Optional[List[Dict]]:
    """Gemini APIをバッチで呼び出し、結果をパースして返す"""

    # バッチ処理用のプロンプトを作成
    articles_json = json.dumps([
        {"id": i, "content": prepare_content(article.get("content", ""))}
        for i, article in enumerate(batch_articles)
    ], ensure_ascii=False)

    prompt = BATCH_PROMPT_TEMPLATE.format(articles_json=articles_json)

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

def main():
    """メイン処理"""
    args = parse_args()

    if not os.path.exists(args.input):
        print(f"エラー: {args.input} が見つかりません")
        sys.exit(1)

    # 入力データを読み込み
    input_articles = load_json(args.input)

    # 非表示フラグのある記事を除外
    private_articles = [a for a in input_articles if not a.get('hidden')]

    # テストモードまたは件数制限
    if args.test:
        private_articles = private_articles[:BATCH_SIZE]
        print(f"🧪 テストモード: {BATCH_SIZE}件のみ処理します\n")
    elif args.limit is not None:
        private_articles = private_articles[:args.limit]
        print(f"処理件数を{args.limit}件に制限します\n")

    # 既存の出力があれば読み込む（レジューム機能）
    existing_articles: List[dict] = []
    if os.path.exists(args.output):
        try:
            existing_articles = load_json(args.output)
            print(f"既存の出力を読み込みました: {len(existing_articles)}件\n")
        except Exception as e:
            print(f"  既存ファイルの読み込みに失敗: {e}。新規で作り直します")

    processed_ids = {article.get('id') for article in existing_articles}
    remaining_articles = [a for a in private_articles if a.get('id') not in processed_ids]

    processed_count = len(private_articles) - len(remaining_articles)

    if not remaining_articles:
        print(f"既に {processed_count}/{len(private_articles)} 件処理済みです。追加処理はありません")
        return

    api_key = get_api_key()
    public_articles = existing_articles

    total_count = len(private_articles)
    print(f"処理開始: 残り{len(remaining_articles)}件の記事を{BATCH_SIZE}件ずつのバッチで処理します\n")

    for i in range(0, len(remaining_articles), BATCH_SIZE):
        batch_articles = remaining_articles[i:i + BATCH_SIZE]
        start_index = processed_count + i

        print(f"\n[{start_index + 1}-{start_index + len(batch_articles)}/{total_count}] バッチ処理中...")

        results = call_gemini_batch(api_key, batch_articles)

        if not results:
            print("  このバッチの処理に失敗しました。スキップします。")
            continue

        for res in results:
            try:
                original_article_index = res['id']
                original_article = batch_articles[original_article_index]

                title = res.get("title", original_article.get("title", "タイトル未設定"))
                category = res.get("category", original_article.get("category", "マインドセット"))
                content = res.get("content", "")

                # パブリック版記事を作成
                public_article = {
                    "id": original_article["id"],
                    "title": title[:50],
                    "content": content,
                    "category": category,
                    "date": original_article["date"],
                    "originalDate": original_article.get("originalDate", original_article["date"]),
                    "createdAt": original_article["createdAt"],
                    "tags": [category, "メンタル"]
                }

                public_articles.append(public_article)

                # 文字数チェック
                content_len = len(content)
                if content_len <= 700:
                    print(f"  ✓ {title} ({content_len}文字)")
                else:
                    print(f"  ⚠ {title} ({content_len}文字)")

            except (IndexError, KeyError) as e:
                print(f"  結果の処理中にエラー: {e} - スキップします")
                continue

        save_json(args.output, public_articles)
        print(f"  進捗保存: {len(public_articles)}件を書き出しました")

        time.sleep(SLEEP_SECONDS)  # API制限対応: 無料版RPM=5 → 15秒待機

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
