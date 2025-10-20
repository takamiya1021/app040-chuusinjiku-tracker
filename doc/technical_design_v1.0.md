# 技術設計書 v1.0
## 中心軸を整える習慣化アプリ

**作成日**: 2025-10-19
**バージョン**: 1.0
**参照**: requirements_v1.0.md

---

## 1. システムアーキテクチャ

### 1.1 全体構成

```
┌─────────────────────────────────────────┐
│           ユーザー（Browser）            │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│       Next.js 14 App Router             │
│  ┌─────────────────────────────────┐   │
│  │  Pages                           │   │
│  │  - Home (今日の記事)             │   │
│  │  - Archive (過去記事一覧)        │   │
│  │  - Categories (カテゴリー別)     │   │
│  └─────────────────────────────────┘   │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  Components                      │   │
│  │  - ArticleCard                   │   │
│  │  - Navigation                    │   │
│  │  - ReadCheckbox                  │   │
│  │  - CategoryFilter                │   │
│  └─────────────────────────────────┘   │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  State Management (Zustand)      │   │
│  │  - articles                      │   │
│  │  - readHistory                   │   │
│  │  - currentArticle                │   │
│  └─────────────────────────────────┘   │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│    LocalStorage / IndexedDB             │
│  - articles.json (全記事データ)          │
│  - readHistory.json (読了履歴)           │
└─────────────────────────────────────────┘
```

### 1.2 技術スタック

#### フロントエンド
- **フレームワーク**: Next.js 14.x (App Router)
- **React**: 18.x
- **言語**: TypeScript 5.x
- **スタイリング**: Tailwind CSS v3
- **アニメーション**: Framer Motion
- **状態管理**: Zustand
- **データ保存**: LocalStorage + IndexedDB（大容量対応）

#### 開発ツール
- **Linter**: ESLint 8.x
- **Formatter**: Prettier
- **パッケージマネージャー**: npm

#### デプロイ
- **静的エクスポート**: Next.js Static Export
- **ホスティング**: Vercel / Netlify / GitHub Pages（TBD）
- **2バージョン対応**:
  - プライベート版: ローカル環境のみ（`articles-private.json`使用）
  - パブリック版: 公開環境（`articles-public.json`使用）
  - 切り替え: ビルド時の環境変数またはファイル差し替えで対応

---

## 2. データモデル

### 2.1 Article（記事）

**重要**: プライベート版とパブリック版で同一構造を使用

```typescript
interface Article {
  id: string;                    // UUID（両バージョンで同一IDを使用）
  title: string;                 // タイトル（30文字以内）
  content: string;               // 本文
                                  // - プライベート版: 元メール本文そのまま（長さ制限なし）
                                  // - パブリック版: 要約版（1000〜3000文字）
  category: string;              // カテゴリー名（両バージョン共通）
  date: string;                  // 記事日付（YYYY-MM-DD）
  originalDate: string;          // 元メール日付（YYYY-MM-DD）
  createdAt: string;             // 作成日時（ISO 8601）
  tags?: string[];               // タグ（オプション）
  number?: number;               // 通し番号（日付昇順で自動採番、表示時に付与）
  hidden?: boolean;              // 非表示フラグ（true: どこにも表示しない）
}
```

**注**:
- `number`はデータファイルには含めず、表示時に動的に採番する
- `hidden`が`true`の記事は、loadArticles時に自動的に除外され、アプリ内のどこにも表示されない

**データファイル名**:
- プライベート版: `articles-private.json`
- パブリック版: `articles-public.json`

### 2.2 ReadHistory（読了履歴）

```typescript
interface ReadHistory {
  articleId: string;             // Article.id
  readAt: string;                // 読了日時（ISO 8601）
  isRead: boolean;               // 読了フラグ
}
```

### 2.3 AppState（アプリ状態）

```typescript
interface AppState {
  articles: Article[];           // 全記事
  readHistory: ReadHistory[];    // 読了履歴
  currentArticle: Article | null;// 現在表示中の記事
  selectedCategory: string | null;// 選択中カテゴリー

  // Actions
  loadArticles: () => void;
  loadReadHistory: () => void;
  markAsRead: (articleId: string) => void;
  getRandomArticle: () => Article;
  getArticlesByCategory: (category: string) => Article[];
}
```

---

## 3. ファイル構成

### 3.1 プロジェクト構造

```
app040-chuusinjiku-tracker/
├── doc/                          # ドキュメント
│   ├── requirements_v1.0.md
│   ├── gmail_collection_proposal.md
│   ├── technical_design_v1.0.md
│   └── implementation_plan_v1.0.md
│
├── png/                          # 画像・図
│
├── note/                         # 開発記録
│
├── data/                         # データファイル（Git管理外）
│   ├── raw_emails.json           # 元メールデータ（一時）
│   ├── articles-private.json     # プライベート版（元本文そのまま）
│   └── articles-public.json      # パブリック版（要約版）
│
├── src/                          # Next.jsアプリ
│   ├── app/                      # App Router
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # ホーム（今日の記事）
│   │   ├── archive/
│   │   │   └── page.tsx          # 過去記事一覧
│   │   └── categories/
│   │       └── page.tsx          # カテゴリー別表示
│   │
│   ├── components/               # 共通コンポーネント
│   │   ├── ArticleCard.tsx       # 記事表示カード
│   │   ├── Navigation.tsx        # ナビゲーション
│   │   ├── ReadCheckbox.tsx      # 読了チェック
│   │   ├── CategoryFilter.tsx    # カテゴリーフィルター
│   │   └── PageTransition.tsx    # ページ遷移アニメーション
│   │
│   ├── store/                    # 状態管理
│   │   └── useStore.ts           # Zustand store
│   │
│   ├── lib/                      # ユーティリティ
│   │   ├── storage.ts            # LocalStorage操作
│   │   ├── indexeddb.ts          # IndexedDB操作
│   │   └── articles.ts           # 記事関連ロジック
│   │
│   ├── types/                    # TypeScript型定義
│   │   └── index.ts
│   │
│   └── styles/                   # グローバルスタイル
│       └── globals.css
│
├── public/                       # 静的ファイル
│   ├── articles.json             # 記事データ（本番用、バージョン切り替え可能）
│   │                             # ローカル: articles-private.json をコピー
│   │                             # 公開環境: articles-public.json をコピー
│   └── favicon.ico
│
├── scripts/                      # データ収集・処理スクリプト
│   ├── collect_emails.md         # Gmail収集手順（MCP利用）
│   └── process_articles.md       # 要約処理手順
│
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## 4. コンポーネント設計

### 4.1 ページコンポーネント

#### Home (`app/page.tsx`)
- **役割**: 今日のランダム記事を表示
- **機能**:
  - アプリ起動時に即座に記事表示
  - ランダム選択アルゴリズム適用
  - 読了チェック機能
  - 次の記事へボタン
    - クリック時: 画面トップまでスムーズスクロール（`window.scrollTo({ top: 0, behavior: 'smooth' })`）
- **状態**: `currentArticle`, `readHistory`

#### Categories (`app/categories/page.tsx`)
- **役割**: 全記事一覧表示（カテゴリー別フィルター機能付き）
- **機能**:
  - カテゴリー一覧表示
  - カテゴリー選択でフィルタリング
  - 各カテゴリーの記事数表示
  - 記事タイトルクリックで本文展開/折りたたみ
  - 記事番号表示（日付古い順に通し番号）
  - ソート: 各カテゴリ内でお気に入り優先 → 番号昇順
- **状態**: `articles`, `categoryFilter`, `expandedArticleId`, `favorites`

**注**: Archiveページは削除し、Categoriesページに統合

### 4.2 共通コンポーネント

#### ArticleCard
```typescript
interface ArticleCardProps {
  article: Article;
  variant: 'full' | 'compact';
  isFavorite?: boolean;
  onFavoriteChange?: (articleId: string) => void;
  onClick?: (articleId: string) => void;
  showNumber?: boolean;  // 記事番号表示フラグ
}
```
- 記事の表示カード
- full: 全文表示、compact: タイトル・カテゴリーのみ表示
- 記事番号表示（小さく表示、指標用）
- クリック時に展開/折りたたみ切り替え

#### Navigation
```typescript
interface NavigationProps {
  currentPath: string;
}
```
- ナビゲーションメニュー
- ホーム / アーカイブ / カテゴリー

#### ReadCheckbox
```typescript
interface ReadCheckboxProps {
  articleId: string;
  isRead: boolean;
  onToggle: (id: string) => void;
}
```
- 読了チェックボックス
- アニメーション付き

#### CategoryFilter
```typescript
interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}
```
- カテゴリーフィルターUI
- チップ形式で表示

#### PageTransition
```typescript
interface PageTransitionProps {
  children: React.ReactNode;
}
```
- ページ遷移アニメーション
- Framer Motion使用

---

## 5. 状態管理（Zustand）

### 5.1 Store設計

```typescript
// store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Store extends AppState {
  // データ読み込み
  loadArticles: () => Promise<void>;  // 非表示記事を自動除外
  loadReadHistory: () => Promise<void>;

  // 記事操作
  getRandomArticle: () => Article | null;  // 非表示記事を除外
  getArticlesByCategory: (category: string) => Article[];
  getArticleById: (id: string) => Article | null;

  // 読了履歴操作
  markAsRead: (articleId: string) => void;
  isArticleRead: (articleId: string) => boolean;

  // フィルター
  setSelectedCategory: (category: string | null) => void;

  // カテゴリー取得
  getAllCategories: () => string[];  // 表示カテゴリーのみ返す
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      articles: [],
      readHistory: [],
      currentArticle: null,
      selectedCategory: null,

      // 実装詳細は省略
    }),
    {
      name: 'chuusinjiku-storage',
      partialize: (state) => ({
        readHistory: state.readHistory,
      }),
    }
  )
);
```

### 5.2 永続化戦略

- **readHistory**: LocalStorage（Zustand persist）
- **articles**: 初回読み込み時に`public/articles.json`からfetch
  - 大容量の場合はIndexedDBにキャッシュ

---

## 6. データフロー

### 6.1 初回ロード

```
1. アプリ起動
   ↓
2. useStore.loadArticles()
   ↓
3. fetch('/articles.json')
   ↓
4. articles[] にセット
   ↓
5. useStore.loadReadHistory()
   ↓
6. LocalStorageから読込
   ↓
7. readHistory[] にセット
   ↓
8. getRandomArticle() でランダム記事取得
   ↓
9. currentArticle にセット
   ↓
10. 画面表示
```

### 6.2 読了チェック

```
1. ユーザーがチェックボックスクリック
   ↓
2. markAsRead(articleId)
   ↓
3. readHistory[] に追加
   ↓
4. LocalStorageに保存
   ↓
5. UI更新
```

---

## 7. ストレージ設計

### 7.1 LocalStorage

**用途**: 読了履歴の保存

**キー**: `chuusinjiku-storage`

**構造**:
```json
{
  "state": {
    "readHistory": [
      {
        "articleId": "uuid-1",
        "readAt": "2025-10-19T10:30:00Z",
        "isRead": true
      }
    ]
  },
  "version": 0
}
```

**容量制限**: 約5MB（読了履歴500件で十分）

### 7.2 IndexedDB（オプション）

**用途**: 記事データのキャッシュ（大容量対応）

**データベース名**: `chuusinjiku-db`

**オブジェクトストア**:
- `articles`: 記事データ
- `metadata`: 最終更新日時など

**使用条件**: articles.jsonが5MB超の場合のみ

---

## 8. UI/UXデザイン

### 8.1 デザインシステム

#### カラーパレット（落ち着いた配色）
```css
:root {
  /* プライマリ */
  --color-primary: #5B7C99;      /* 落ち着いた青 */
  --color-primary-light: #7A9CB8;
  --color-primary-dark: #3E5A75;

  /* セカンダリ */
  --color-secondary: #A8C5D1;    /* ソフトな水色 */

  /* ニュートラル */
  --color-bg: #FAFAFA;            /* 背景 */
  --color-surface: #FFFFFF;       /* カード背景 */
  --color-text: #2D3748;          /* 本文テキスト */
  --color-text-secondary: #718096; /* 補助テキスト */

  /* アクセント */
  --color-accent: #E8A87C;        /* 温かみのあるオレンジ */
  --color-success: #81C784;       /* 読了チェック */
}
```

#### タイポグラフィ
```css
/* 見出し */
font-family: 'Noto Sans JP', sans-serif;
font-weight: 700;

/* 本文 */
font-family: 'Noto Serif JP', serif;
font-size: 16px;
line-height: 1.8;
letter-spacing: 0.05em;
```

### 8.2 レスポンシブブレークポイント

```typescript
const breakpoints = {
  sm: '640px',   // スマートフォン
  md: '768px',   // タブレット
  lg: '1024px',  // デスクトップ
  xl: '1280px',  // 大画面
};
```

### 8.3 アニメーション仕様

#### ページ遷移
```typescript
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' }
};
```

#### 記事カード
```typescript
const cardHover = {
  scale: 1.02,
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  transition: { duration: 0.2 }
};
```

#### チェックボックス
```typescript
const checkboxAnimation = {
  checked: { scale: [1, 1.2, 1], opacity: 1 },
  unchecked: { scale: 1, opacity: 0.6 }
};
```

---

## 9. パフォーマンス最適化

### 9.1 初回ロード最適化

1. **Static Generation**: Next.js Static Exportで完全静的化
2. **Code Splitting**: 各ページごとに自動分割
3. **Image Optimization**: 画像は使用最小限、SVGアイコン推奨
4. **Font Optimization**: Google Fonts最適化

### 9.2 ランタイム最適化

1. **Virtual Scrolling**: 記事一覧が100件超の場合は仮想スクロール実装
2. **Memoization**: React.memo、useMemo活用
3. **Lazy Loading**: 画面外コンポーネントの遅延読み込み

### 9.3 目標指標

- **初回ロード**: 3秒以内（3G回線）
- **Time to Interactive**: 2秒以内
- **ページ遷移**: 0.5秒以内
- **Lighthouse Score**: 90点以上（全項目）

---

## 10. セキュリティ

### 10.1 データ保護

- **ローカルのみ保存**: 外部送信なし
- **個人情報除外**: メールアドレス等は記事データから除外

### 10.2 XSS対策

- **サニタイゼーション**: 記事本文のHTML特殊文字エスケープ
- **CSP設定**: Content Security Policy適用

---

## 11. デプロイ戦略

### 11.1 ビルドプロセス（2バージョン対応）

#### プライベート版（ローカル開発用）
```bash
# 1. プライベート版データをコピー
cp data/articles-private.json public/articles.json

# 2. Next.js開発サーバー起動
npm run dev

# または、ローカルビルド
npm run build
```

#### パブリック版（公開環境用）
```bash
# 1. パブリック版データをコピー
cp data/articles-public.json public/articles.json

# 2. Next.js静的エクスポート
npm run build

# 3. 出力確認
# out/ ディレクトリに静的ファイル生成
```

#### 自動化スクリプト（推奨）
```bash
# package.json に追加
{
  "scripts": {
    "dev": "next dev",
    "build:private": "cp data/articles-private.json public/articles.json && next build",
    "build:public": "cp data/articles-public.json public/articles.json && next build",
    "build": "npm run build:public"
  }
}
```

### 11.2 ホスティング選定基準

| 項目 | Vercel | Netlify | GitHub Pages |
|------|--------|---------|--------------|
| **無料枠** | ✅ | ✅ | ✅ |
| **独自ドメイン** | ✅ | ✅ | ✅ |
| **自動デプロイ** | ✅ | ✅ | ✅ |
| **Next.js対応** | ◎ | ○ | △ |
| **推奨度** | ⭐⭐⭐ | ⭐⭐ | ⭐ |

**推奨**: Vercel（Next.js最適化）

---

## 12. テスト戦略

### 12.1 テスト方針

- **単体テスト**: 主要ロジックのみ（store、lib）
- **E2Eテスト**: 基本フローのみ（後回し可）
- **手動テスト**: デザイン・UX確認

### 12.2 優先テスト項目

1. ランダム記事取得ロジック
2. 読了履歴の保存・読み込み
3. カテゴリーフィルタリング
4. レスポンシブデザイン（3サイズ）

---

## 13. 将来的な拡張

### 13.1 フェーズ2機能（v2.0）

- お気に入り機能
- 検索機能（全文検索）
- 読書統計の可視化
- メモ・感想記録
- PWA化（オフライン完全対応）

### 13.2 技術的負債の予防

- TypeScript厳格モード有効化
- ESLint厳格ルール適用
- コンポーネント単位でのドキュメント

---

## 14. PWA（Progressive Web App）化

### 14.1 概要
ホーム画面にアプリとして追加可能にし、よりアプリライクな体験を提供する。

### 14.2 必要なコンポーネント

#### マニフェストファイル（`public/manifest.json`）
```json
{
  "name": "中心軸を整える",
  "short_name": "中心軸",
  "description": "メンタルを整える習慣化アプリ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

#### アイコン画像
- `public/icons/icon-192x192.png`（192x192px）
- `public/icons/icon-512x512.png`（512x512px）
- `public/favicon.ico`

### 14.3 Next.js設定

#### next-pwaパッケージ使用
```bash
npm install next-pwa
```

#### `next.config.js`
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
});
```

### 14.4 メタタグ設定（`app/layout.tsx`）

```typescript
export const metadata = {
  title: '中心軸を整える',
  description: 'メンタルを整える習慣化アプリ',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '中心軸を整える',
  },
};
```

### 14.5 動作確認

#### ローカル確認
```bash
npm run build
npm run start
```

#### 確認項目
- Chrome DevToolsのLighthouse → PWAスコア確認
- 「ホーム画面に追加」ボタンが表示されるか
- オフライン動作確認
- アイコンが正しく表示されるか

### 14.6 デプロイ後の確認
- モバイルブラウザで「ホーム画面に追加」が可能か
- ホーム画面から起動してスタンドアロン表示されるか
- プッシュ通知の許可ダイアログが不要に抑制されているか

---

## 15. 開発環境セットアップ

### 15.1 必要なツール

- Node.js 18.x以上
- npm 9.x以上
- VSCode（推奨）

### 15.2 セットアップコマンド

```bash
# プロジェクト作成
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir

# 依存パッケージ追加
npm install zustand framer-motion
npm install -D @types/node

# 開発サーバー起動
npm run dev
```

---

## 15. 変更履歴

### 2025-10-20 - v1.1 データ構造拡張
**実装者**: クロ

#### 変更内容
1. **Article型に`number`フィールド追加**
   - 日付昇順で通し番号を付与（表示時に動的採番）
   - データファイルには含めず、アプリケーション側で管理

2. **Article型に`hidden`フィールド追加**
   - 非表示フラグ（`true`の場合、アプリ内のどこにも表示しない）
   - お知らせ・イベント告知・情報共有・販売会案内の4カテゴリー（計5件）を非表示化

3. **状態管理の変更**
   - `loadArticles()`: 読み込み時に`hidden: true`の記事を自動除外
   - `getRandomArticle()`: ランダム取得時に非表示記事を除外
   - `getAllCategories()`: 表示カテゴリーのみ返す

#### 影響範囲
- `types/index.ts`: Article型定義更新
- `store/useStore.ts`: フィルター処理追加
- `public/articles.json`: 非表示フラグ設定

---

**承認**: □ あおいさん
**作成者**: クロ
**次のステップ**: 実装計画書作成（TDD準拠版）
