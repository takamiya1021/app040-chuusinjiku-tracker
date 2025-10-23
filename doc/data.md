# 記事データ管理

## ⚠️ 絶対禁止事項

**以下のファイルは1ミリも触るな：**
- ❌ `public/articles.json`（マスター全文版）
- ❌ `public/short.json`（マスター要約版）

**これらのファイルに対して禁止されていること：**
- ❌ 直接編集
- ❌ 上書き（`cp` コマンドで上書き等）
- ❌ 勝手にバックアップ作成

## データフロー

```
articles.json (マスター全文版・1158件・6.4MB)
    ↓ cp public/articles.json data/input.json
input.json (作業用・マスターのコピー)
    ↓ create_public_data.py (Gemini API・700文字要約・899件のみ)
short.json (マスター要約版・899件・1.5MB)
    ↓ cp public/short.json public/articles-app.json
articles-app.json (アプリ読み込み・現在は要約版使用中)
```

## ファイル一覧

### 運用中ファイル

| ファイル | 件数 | サイズ | 説明 |
|---------|------|--------|------|
| `public/articles.json` | 1158件 | 6.4MB | **マスター全文版**（全ての基準）・❌絶対編集禁止❌ |
| `public/short.json` | 804件 | 1.5MB | **マスター要約版**（1158件のうち354件非表示・クリーニング済み） |
| `public/articles-app.json` | 804件 | 1.5MB | **アプリ読み込み**（要約版使用中） |
| `data/input.json` | 1158件 | 6.4MB | 作業用・マスターからコピー |

### アーカイブファイル（バックアップ）

| ファイル | サイズ | 説明 |
|---------|--------|------|
| `data/raw_emails.json` | 6.8M | Gmail取得元データ（バックアップ用） |
| `data/raw_emails_2022.json` | 1.6M | Gmail取得元データ（2022年分・バックアップ用） |

## コマンド

```bash
# 1. マスターを作業用にコピー
cp public/articles.json data/input.json

# 2. 要約版を作成
python3 scripts/create_public_data.py

# 3. 全文版に切り替え
cp public/articles.json public/articles-app.json

# 4. 要約版に切り替え
cp public/short.json public/articles-app.json
```

## データ取得スクリプト（参考）

### Gmail APIからデータ取得

**注意**: `scripts/fetch_gmail_messages.py` は現在使用不可（Gmail API認証情報が削除済み）

マスターデータ（`public/articles.json`）は既に作成済みのため、通常は再取得不要。

**再取得が必要な場合**:
1. Google Cloud Consoleで Gmail API 有効化
2. OAuth認証情報（`credentials.json`）取得
3. 認証して `token.json` 生成
4. スクリプト実行

詳細は [Gmail API公式ドキュメント](https://developers.google.com/gmail/api/quickstart/python) 参照。
