# データ管理

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

## 運用中ファイル

| ファイル | 件数 | サイズ | 説明 |
|---------|------|--------|------|
| `public/articles.json` | 1158件 | 6.4MB | **マスター全文版**（全ての基準）・編集禁止 |
| `public/short.json` | 804件 | 1.5MB | **マスター要約版**（1158件のうち354件非表示・クリーニング済み） |
| `public/articles-app.json` | 804件 | 1.5MB | **アプリ読み込み**（要約版使用中） |
| `data/input.json` | 1158件 | 6.4MB | 作業用・マスターからコピー |

## アーカイブファイル（バックアップ）

| ファイル | サイズ | 説明 |
|---------|--------|------|
| `data/raw_emails.json` | 6.8MB | Gmail取得元データ（バックアップ用） |
| `data/raw_emails_2022.json` | 1.6MB | 2022年分元データ（バックアップ用） |

## データ切り替えコマンド

### 要約版作成
```bash
# 1. マスターを作業用にコピー
cp public/articles.json data/input.json

# 2. 要約版作成（Gemini API使用）
python3 scripts/create_public_data.py
```

### アプリ読み込みデータ切り替え
```bash
# 全文版に切り替え
cp public/articles.json public/articles-app.json

# 要約版に切り替え
cp public/short.json public/articles-app.json
```

## ビルド時のデータバージョン切り替え
```bash
# プライベート版でビルド
npm run build:private

# パブリック版でビルド
npm run build:public
```

## データ編集の原則

### 絶対禁止
- ❌ マスターファイル（articles.json、short.json）の直接編集

### 推奨フロー
1. マスターファイルをinput.jsonにコピー
2. input.jsonで編集作業
3. スクリプトで処理してマスターファイル更新
4. バックアップ取得

## データ構造

### 記事オブジェクト
```typescript
{
  id: string,           // 記事ID
  title: string,        // タイトル
  content: string,      // 本文
  category: string,     // カテゴリー
  date: string,        // 日付
  source?: string,     // ソース（Gmail等）
  displayInList?: boolean  // リスト表示フラグ（全文版のみ）
}
```

## データ取得元
- Gmail API経由で取得（過去メール）
- 今後の拡張: 定期的な自動取得（doc/gmail_collection_proposal.md参照）

## パフォーマンス考慮
- 要約版使用でアプリサイズ削減（6.4MB → 1.5MB）
- 初回ロード時間の短縮
- PWAキャッシュ効率化
