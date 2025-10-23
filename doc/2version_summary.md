# 2バージョン対応

## バージョン比較

| 項目 | 全文版 | 要約版 |
|------|--------|--------|
| ファイル | `articles.json` | `short.json` |
| 文字数 | 2,000文字以上 | 700文字程度 |
| サイズ | 6.4MB | 1.1MB予定 |
| 件数 | 899件 | 899件 |
| 用途 | 詳細閲覧 | 速度重視 |

## データ構造

```typescript
interface Article {
  id: string;
  title: string;
  content: string;  // 唯一の違い（全文 or 要約）
  category: string;
  date: string;
  originalDate: string;
  createdAt: string;
  tags?: string[];
}
```

## 切り替え方法

```bash
# 全文版
cp public/articles.json public/articles-app.json

# 要約版
cp public/short.json public/articles-app.json
```
