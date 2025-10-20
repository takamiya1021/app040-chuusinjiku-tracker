#!/usr/bin/env python3
import json

# 2つのファイルを読み込み
with open('data/raw_emails.json', 'r', encoding='utf-8') as f:
    emails_2023 = json.load(f)

with open('data/raw_emails_2022.json', 'r', encoding='utf-8') as f:
    emails_2022 = json.load(f)

# マージ（重複チェック付き）
all_emails = emails_2023.copy()
existing_ids = {email['id'] for email in emails_2023}

for email in emails_2022:
    if email['id'] not in existing_ids:
        all_emails.append(email)

# 日付でソート（新しい順）
all_emails.sort(key=lambda x: x['date'], reverse=True)

# 保存
with open('data/raw_emails.json', 'w', encoding='utf-8') as f:
    json.dump(all_emails, f, ensure_ascii=False, indent=2)

print(f"マージ完了: {len(all_emails)}件（2023-2025: {len(emails_2023)}件 + 2022: {len(emails_2022)}件）")
