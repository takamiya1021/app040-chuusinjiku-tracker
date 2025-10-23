# プロジェクト構造

## ディレクトリ構成

```
app040-chuusinjiku-tracker/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # ホームページ
│   ├── globals.css          # グローバルスタイル
│   ├── fonts/               # フォントファイル
│   └── categories/          # カテゴリー別ページ
│
├── components/              # 共通コンポーネント
│   ├── ArticleCard.tsx     # 記事カード表示
│   ├── CategoryFilter.tsx  # カテゴリーフィルター
│   ├── Navigation.tsx      # ナビゲーション
│   ├── ReadCheckbox.tsx    # 既読チェック
│   ├── FavoriteButton.tsx  # お気に入りボタン
│   ├── PageTransition.tsx  # ページ遷移アニメーション
│   └── *.test.tsx          # 各コンポーネントのテスト
│
├── lib/                     # ユーティリティ関数
│   ├── articles.ts         # 記事データ処理
│   ├── storage.ts          # ストレージ処理
│   └── *.test.ts           # テストファイル
│
├── store/                   # 状態管理（Zustand）
│   ├── useStore.ts         # グローバル状態管理
│   └── useStore.test.ts    # ストアテスト
│
├── types/                   # TypeScript型定義
│
├── public/                  # 静的ファイル・記事データ
│   ├── articles.json       # マスター全文版（1158件、全ての基準）
│   ├── short.json          # マスター要約版（804件、354件非表示）
│   ├── articles-app.json   # アプリ読み込み用（要約版・クリーニング済み）
│   ├── manifest.json       # PWAマニフェスト
│   └── sw.js               # Service Worker
│
├── data/                    # データ作業用ディレクトリ
│   ├── input.json          # 作業用（マスターコピー）
│   ├── raw_emails.json     # Gmail元データ（バックアップ）
│   └── raw_emails_2022.json # 2022年分元データ
│
├── scripts/                 # データ処理スクリプト
│   └── create_public_data.py # 要約版作成（Gemini API）
│
├── doc/                     # ドキュメント
│   ├── requirements_v1.0.md        # 要件定義書
│   ├── technical_design_v1.0.md    # 技術設計書
│   ├── implementation_plan_v1.0.md # 実装計画書
│   ├── data.md                     # データ管理ドキュメント
│   ├── 2version_summary.md         # 2バージョン要約
│   └── gmail_collection_proposal.md # Gmail収集提案
│
├── png/                     # 画像・スクリーンショット
├── note/                    # 開発記録・Note記事
│
├── __tests__/              # テストディレクトリ
│
├── .next/                  # Next.jsビルド出力
├── node_modules/           # 依存パッケージ
├── .serena/               # Serena設定
├── .claude/               # Claude設定
│
├── package.json            # npm依存関係・スクリプト
├── package-lock.json       # 依存バージョンロック
├── tsconfig.json          # TypeScript設定
├── next.config.js         # Next.js設定
├── tailwind.config.ts     # Tailwind設定
├── postcss.config.mjs     # PostCSS設定
├── jest.config.js         # Jest設定
├── jest.setup.js          # Jestセットアップ
├── .eslintrc.json        # ESLint設定
├── .gitignore            # Git除外設定
├── .env                  # 環境変数（Git管理外）
├── .env.example          # 環境変数例
└── README.md             # プロジェクト説明
```

## 重要ファイルの役割

### 設定ファイル
- **package.json**: 依存パッケージ管理、npmスクリプト定義
- **tsconfig.json**: TypeScript設定（strict mode、パスエイリアス）
- **next.config.js**: Next.js設定（PWA、ビルド最適化）
- **tailwind.config.ts**: Tailwindカスタマイズ
- **.eslintrc.json**: Next.js標準ESLint設定

### データファイル（public/）
- **articles.json**: マスター全文版（1158件、全ての基準・編集禁止）
- **short.json**: マスター要約版（1158件のうち354件非表示、804件表示・クリーニング済み）
- **articles-app.json**: アプリが読み込むファイル（要約版使用中）

### コード構造
- **app/**: ページ・レイアウト（App Router方式）
- **components/**: 再利用コンポーネント（各テスト併置）
- **lib/**: ビジネスロジック・ユーティリティ
- **store/**: Zustandグローバル状態管理
- **types/**: 共通型定義
