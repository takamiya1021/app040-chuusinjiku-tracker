# コードスタイルと規約

## TypeScript設定
- **strict mode有効** - 厳格な型チェック
- **パスエイリアス**: `@/*` → プロジェクトルート相対パス
- **JSX**: preserve（Next.jsが処理）
- **型定義必須** - Props、関数の引数・戻り値

## コンポーネント規約
- **関数コンポーネント** - `export default function ComponentName() {}`
- **Props型定義** - インターフェースで明示的に定義
- **ファイル命名** - PascalCase.tsx（例: ArticleCard.tsx）

## スタイリング
- **Tailwind CSS** - ユーティリティクラス使用
- **動的クラス** - テンプレートリテラルで条件付きクラス構築
- **レスポンシブ** - モバイルファースト設計

## テスト
- **テスト配置** - コンポーネントと同じディレクトリ（*.test.tsx）
- **data-testid** - テスト用ID属性を付与
- **カバレッジ目標** - 80%以上

## 命名規則
- **コンポーネント**: PascalCase
- **関数**: camelCase
- **ハンドラー関数**: handle* プレフィックス（例: handleCardClick）
- **型定義**: PascalCase（例: ArticleCardProps）
- **定数**: UPPER_SNAKE_CASE（グローバル定数）

## ESLint設定
- Next.js標準設定使用
  - next/core-web-vitals
  - next/typescript
- カスタムルール追加なし

## コメント
- **日本語コメント推奨**
- **複雑なロジックには説明必須**
- **JSDoc形式推奨**（TypeScript型と併用）

## ディレクトリ構造
- `app/` - Next.js App Router（ページ・レイアウト）
- `components/` - 再利用可能コンポーネント
- `lib/` - ユーティリティ関数・ロジック
- `store/` - グローバル状態管理（Zustand）
- `types/` - TypeScript型定義
- `public/` - 静的ファイル・記事データ
- `doc/` - ドキュメント
- `png/` - 画像・スクリーンショット
- `note/` - 開発記録・Note記事
