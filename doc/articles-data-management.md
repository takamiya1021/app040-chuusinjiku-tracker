# 記事データ管理ドキュメント

## 📁 重要なデータファイル

### ⭐ `public/articles.json` - **厳重保管用マスターデータ**
- **絶対に編集・削除・上書き禁止**
- **内容**: 1,158件の記事データ（259件に非表示フラグ付き）
- **作成日**: 2025-10-21
- **用途**: 259件の非表示フラグ設定を保管する唯一のマスターデータ
- **特徴**:
  - `hidden: true` が259件に設定済み（事務連絡系記事）
  - 表示対象記事は899件
  - 全文版（要約前のデータ）
- **重要性**: このファイルがなくなると259件の非表示設定が失われる

### 📱 `public/articles-app.json` - **アプリ使用中のデータ**
- **内容**: `articles.json` のコピー
- **作成日**: 2025-10-22
- **用途**: アプリが実際に読み込むファイル
- **読み込み**: `app/page.tsx:32` で `/articles-app.json` を読み込み
- **変更可能**: アプリの動作確認・テスト用に変更可能
- **復元方法**: `cp public/articles.json public/articles-app.json`

### 💾 `public/articles-fulltext.json` - **バックアップ**
- **内容**: 全文版バックアップ（articles.jsonと同一）
- **作成日**: 2025-10-21 03:11
- **用途**: 予備バックアップ

## 🔄 データの関係性

```
articles.json (マスター・厳重保管)
    ↓ コピー
articles-app.json (アプリ使用)
    ↓ アプリが読み込み
app/page.tsx (fetch('/articles-app.json'))
```

## ⚠️ 絶対に守るべきルール

### ❌ 禁止事項
1. **`public/articles.json` を直接編集・削除・上書きしない**
2. **`public/articles.json` をアプリのデータとして使用しない**
3. **259件の非表示フラグを削除しない**

### ✅ 許可事項
1. **`public/articles-app.json` は自由に変更可能**
2. **テスト・確認のためにarticles-app.jsonを使用**
3. **問題があればarticles.jsonからコピーし直す**

## 🛠️ 作業手順

### articles-app.json を復元する場合
```bash
cp public/articles.json public/articles-app.json
```

### マスターデータを確認する場合
```bash
python3 -c "import json; data = json.load(open('public/articles.json')); hidden = sum(1 for a in data if a.get('hidden')); print(f'総数: {len(data)}, 非表示: {hidden}, 表示: {len(data)-hidden}')"
```

## 📊 データ統計（2025-10-22時点）

| 項目 | 値 |
|------|-----|
| 総記事数 | 1,158件 |
| 非表示記事（hidden: true） | 259件 |
| 表示対象記事 | 899件 |
| ファイルサイズ | 6.4MB |
| 状態 | 全文版（要約前） |

## 📝 非表示フラグの内訳（259件）

昨日（2025-10-21）にあおいさんが手動で設定した事務連絡系記事：
- カテゴリー除外: 5件
- タイトルキーワード第1弾: 129件
- 通し番号指定: 21件
- タイトルキーワード第2弾: 98件
- 追加指定: 6件

## 🚨 緊急時の対応

### articles.json が消えた・壊れた場合
1. `public/articles-fulltext.json` からコピー
2. それも無い場合は `public/articles-master-259hidden.json` を確認
3. 全て無い場合は昨日のバックアップから復元

### 非表示フラグが消えた場合
1. **絶対に慌てて再実行しない**
2. まず `public/articles.json` の内容を確認
3. バックアップファイルから復元

## 📅 更新履歴

### 2025-10-22 00:12
- `articles-app.json` を新規作成（アプリ用）
- `app/page.tsx` を `/articles-app.json` 読み込みに変更
- マスターデータとアプリデータを分離
- このドキュメント作成

### 2025-10-21
- `articles.json` に259件の非表示フラグ設定
- あおいさんが手動で設定完了
- マスターデータとして厳重保管指示
