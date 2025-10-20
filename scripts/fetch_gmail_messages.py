#!/home/ustar-wsl-2-2/.local/lib/mcp-servers/gmail/.venv/bin/python
"""
Gmail APIを使ってメールを取得してJSONに保存するスクリプト
"""

import json
import os
import sys
import base64
from typing import List, Dict, Any
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Gmail MCP のトークンパスを使用
TOKEN_PATH = os.path.expanduser("~/.local/lib/mcp-servers/gmail/token.json")
OUTPUT_PATH = "data/raw_emails_2022.json"

def get_gmail_service():
    """Gmail APIサービスを初期化"""
    if not os.path.exists(TOKEN_PATH):
        print(f"エラー: トークンファイルが見つかりません: {TOKEN_PATH}")
        sys.exit(1)

    with open(TOKEN_PATH, 'r') as token:
        token_data = json.load(token)
        creds = Credentials.from_authorized_user_info(token_data)

    return build('gmail', 'v1', credentials=creds)

def parse_message_body(message: Dict[str, Any]) -> str:
    """メール本文を抽出"""
    def get_text_part(parts):
        text = ""
        for part in parts:
            if part.get("mimeType") == "text/plain":
                if "data" in part.get("body", {}):
                    text += base64.urlsafe_b64decode(part["body"]["data"]).decode()
            elif "parts" in part:
                text += get_text_part(part["parts"])
        return text

    payload = message.get("payload", {})
    if "parts" in payload:
        return get_text_part(payload["parts"])
    else:
        body = payload.get("body", {})
        if "data" in body:
            return base64.urlsafe_b64decode(body["data"]).decode()
        return ""

def get_headers_dict(message: Dict[str, Any]) -> Dict[str, str]:
    """ヘッダーを辞書形式で取得"""
    headers = {}
    for header in message.get("payload", {}).get("headers", []):
        headers[header["name"]] = header["value"]
    return headers

def fetch_all_messages(service, query: str, max_total: int = 1000) -> List[Dict[str, Any]]:
    """
    Gmail APIでページネーションを使って全メールを取得

    Args:
        service: Gmail APIサービス
        query: 検索クエリ
        max_total: 取得する最大件数

    Returns:
        メールデータのリスト
    """
    all_emails = []
    page_token = None

    print(f"検索クエリ: {query}")
    print(f"メール取得開始...")

    while len(all_emails) < max_total:
        try:
            # メッセージIDリストを取得（ページネーション対応）
            params = {
                'userId': 'me',
                'q': query,
                'maxResults': min(100, max_total - len(all_emails))
            }
            if page_token:
                params['pageToken'] = page_token

            response = service.users().messages().list(**params).execute()
            messages = response.get('messages', [])

            if not messages:
                print("これ以上メールが見つかりませんでした")
                break

            print(f"  {len(messages)}件のメールIDを取得（合計: {len(all_emails) + len(messages)}件）")

            # 各メールの詳細を取得
            for i, msg_info in enumerate(messages, 1):
                msg_id = msg_info['id']

                # メール詳細取得
                message = service.users().messages().get(
                    userId='me',
                    id=msg_id,
                    format='full'
                ).execute()

                # ヘッダー情報抽出
                headers = get_headers_dict(message)

                # 本文抽出
                body = parse_message_body(message)

                # スニペット取得
                snippet = message.get('snippet', '')

                # データ構造作成
                email_data = {
                    "id": msg_id,
                    "subject": headers.get("Subject", "No Subject"),
                    "date": headers.get("Date", "Unknown Date"),
                    "body": body,
                    "snippet": snippet
                }

                all_emails.append(email_data)

                # 進捗表示（10件ごと）
                if i % 10 == 0:
                    print(f"    詳細取得中... {i}/{len(messages)}")

            # 次のページトークン取得
            page_token = response.get('nextPageToken')
            if not page_token:
                print("全てのページを取得しました")
                break

        except Exception as e:
            print(f"エラー発生: {e}")
            break

    return all_emails

def main():
    """メイン処理"""
    # Gmail APIサービス初期化
    service = get_gmail_service()

    # 検索クエリ（2022年分のみ）
    query = "from:mail@goodluckfortune.co.jp after:2022/01/01 before:2023/01/01"

    # メール取得
    emails = fetch_all_messages(service, query, max_total=1000)

    print(f"\n取得完了: {len(emails)}件のメール")

    # JSONファイルに保存
    os.makedirs("data", exist_ok=True)

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(emails, f, ensure_ascii=False, indent=2)

    print(f"保存完了: {OUTPUT_PATH}")

    # 統計情報表示
    if emails:
        print("\n統計情報:")
        print(f"  - 最初のメール日付: {emails[0]['date']}")
        print(f"  - 最後のメール日付: {emails[-1]['date']}")
        print(f"  - 平均本文文字数: {sum(len(e['body']) for e in emails) // len(emails)}")

if __name__ == "__main__":
    main()
