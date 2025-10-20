# 実装計画書 v1.0（TDD準拠版）
## 中心軸を整える習慣化アプリ

**作成日**: 2025-10-19
**バージョン**: 1.0
**参照**: requirements_v1.0.md, technical_design_v1.0.md

---

## 実装方針

### TDD（Test-Driven Development）適用範囲
- **Phase 0**: テスト環境構築（必須）
- **Phase 1〜6**: Red-Green-Refactorサイクル適用
- **各Phase完了条件**: 全テストパス + コードカバレッジ80%以上

### 段階的実装
1. データ収集・前処理（Phase 1-2）
2. コアロジック実装（Phase 3）
3. UI実装（Phase 4-5）
4. 統合・デプロイ（Phase 6）

---

## Phase 0: テスト環境構築（予定工数: 2時間）

### 目的
アプリ実装前にテスト基盤を整備し、TDDサイクルを回せる状態にする。

### タスク
- [x] Next.js 14プロジェクト作成
- [x] Jest + React Testing Library セットアップ
- [x] テスト設定ファイル作成（jest.config.js, jest.setup.js）
- [x] サンプルテスト実行確認
- [x] ESLint設定（Prettierは不要）

### 実装内容

#### プロジェクト初期化
```bash
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npm install zustand framer-motion
```

#### jest.config.js
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'store/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### 完了条件
- ✅ `npm test` でテスト実行可能
- ✅ カバレッジレポート出力可能
- ✅ サンプルテストがパス

---

## Phase 1: データ収集（予定工数: 4時間）

### 目的
Gmailから500〜700通のメールを取得し、中間データとして保存。

### タスク
- [x] Gmail MCP Serverトークン確認（`~/.local/lib/mcp-servers/gmail/token.json`）
- [x] Pythonスクリプト作成（Gmail API直接呼び出し + ページネーション）
- [x] Gmail検索クエリ実行（送信者指定: `from:mail@goodluckfortune.co.jp`）
- [x] 2023-2025年のメール取得（983件）
- [x] 2022年のメール取得（188件）
- [x] 両ファイルをマージ（合計1171件）
- [x] `data/raw_emails.json` 保存完了

### 実装内容

#### Gmail検索条件（実際の実装）
- **送信者**: `mail@goodluckfortune.co.jp`
- **日付範囲（2023-2025）**: `after:2023/01/01`
- **日付範囲（2022）**: `after:2022/01/01 before:2023/01/01`
- **取得方法**: Gmail API直接呼び出し（MCP経由ではなく）
- **ページネーション**: `pageToken` を使用して100件ずつ取得
- **認証**: Gmail MCPのトークン（`~/.local/lib/mcp-servers/gmail/token.json`）を再利用

#### 中間データ構造
```json
[
  {
    "id": "gmail-message-id",
    "subject": "メール件名",
    "date": "2023-01-01T10:00:00Z",
    "body": "メール本文（HTML/テキスト）",
    "snippet": "冒頭100文字"
  }
]
```

### 完了条件
- ✅ 500件以上のメール取得
- ✅ `data/raw_emails.json` に保存完了
- ✅ データ品質確認（欠損なし）

### 備考
- この段階ではテストなし（データ収集作業）
- 詳細手順は `scripts/collect_emails.md` に記載

---

## Phase 2: データ処理（2バージョン作成）（予定工数: 4時間）

### 目的
取得したメールから、プライベート版（元本文そのまま）とパブリック版（要約版）の2つのデータセットを作成。

### タスク
- [ ] プライベート版データ作成（30分〜1時間）
  - [x] タイトル・カテゴリー生成プロンプト作成
  - [ ] Gemini API（gemini-2.5-flash）経由で処理（Pythonスクリプト）
  - [x] 元本文をそのまま保持
  - [ ] `data/articles-private.json` 保存
- [ ] パブリック版データ作成（2〜3時間）
  - [ ] 要約プロンプト作成（著作権対策含む）
  - [ ] Gemini API（gemini-2.5-flash）経由でバッチ処理（Pythonスクリプト）
  - [ ] カテゴリー自動分類
  - [ ] タイトル生成
  - [ ] `data/articles-public.json` 保存
- [ ] データ検証（両バージョン）
  - [ ] 文字数チェック
  - [ ] 重複チェック
  - [ ] 記事数の一致確認

### 実装方針（重要）
- **Gemini CLIは使用しない**: 1171件のバッチ処理には向かない（1問1答想定）
- **Gemini APIを直接使用**: Pythonスクリプトで gemini-2.5-flash を呼び出し
- **APIキー**: スクリプト内で設定（環境変数または直接記述）
- **レート制限対策**: 1秒待機 + 100件ごとに進捗保存

### 実装内容

#### プライベート版プロンプト
```
以下のメール本文を分析し、タイトルとカテゴリーのみ提案してください。
本文はそのまま使用するため、要約は不要です。

【タスク】
- タイトル: 30文字以内で内容を表すタイトル
- カテゴリー: 1つ選択（自己受容、目標設定、習慣形成、マインドセット、人間関係、感謝、行動力など）

【出力形式】
タイトル: [タイトル]
カテゴリー: [カテゴリー名]

[メール本文]
```

#### パブリック版プロンプト（著作権対策含む）
```
以下のメール本文を、メンタルを整える読み物として要約してください。

【要約条件】
- 文字数: 1000〜3000文字（元の長さに応じて調整）
- 心に響くメッセージ・本質的な内容を保持
- 読みやすく、自然な文章構成
- カテゴリーを1つ提案（例: 自己受容、目標設定、習慣形成、マインドセット、人間関係、感謝、行動力など）

【著作権対策（必須）】
- 元の表現・言い回しをそのまま使用しない
- 固有の言い回しや独自の表現を避ける
- 伝えたい本質的なメッセージ・教訓を抽出し、一般的でわかりやすい表現に再構成する
- 引用ではなく、内容を理解した上での「再構成」として作成する
- オリジナルとは異なる文章構成・言い回しを使用する

【出力形式】
タイトル: [30文字以内の魅力的なタイトル]
カテゴリー: [カテゴリー名]
本文: [要約された本文]

[メール本文]
```

#### 最終データ構造（両バージョン共通）

**プライベート版（articles-private.json）**:
```json
[
  {
    "id": "uuid-v4",
    "title": "心を整える3つの習慣",
    "content": "元メール本文そのまま（長さ制限なし）...",
    "category": "習慣形成",
    "date": "2023-01-01",
    "originalDate": "2023-01-01",
    "createdAt": "2025-10-19T12:00:00Z",
    "tags": ["習慣", "メンタル"]
  }
]
```

**パブリック版（articles-public.json）**:
```json
[
  {
    "id": "uuid-v4",
    "title": "心を整える3つの習慣",
    "content": "要約された本文（1000〜3000文字）...",
    "category": "習慣形成",
    "date": "2023-01-01",
    "originalDate": "2023-01-01",
    "createdAt": "2025-10-19T12:00:00Z",
    "tags": ["習慣", "メンタル"]
  }
]
```

**重要**: 両バージョンで同一のIDを使用

### 完了条件
- ✅ プライベート版: 500件以上の記事データ生成（元本文保持）
- ✅ パブリック版: 500件以上の記事データ生成（要約版）
- ✅ パブリック版: 全記事が1000〜3000文字範囲
- ✅ 両バージョン: カテゴリー分類完了
- ✅ 両バージョン: 重複記事なし
- ✅ 両バージョン: 記事数の一致（同じ記事セット）
- ✅ 両バージョン: 同一IDの使用
- ✅ パブリック版: 著作権対策確認（元の表現と異なる一般的な表現に再構成されている）

### 備考
- この段階でもテストなし（データ処理作業）
- 詳細手順は `scripts/process_articles.md` に記載

---

## Phase 3: コアロジック実装（予定工数: 6時間）

### 目的
記事管理・読了履歴の中核ロジックをTDDで実装。

### 3.1 データ型定義（1時間）

#### タスク
- [x] **[Red]** `types/index.ts` のテスト作成
- [x] **[Green]** 型定義実装（Article, ReadHistory, AppState）
- [x] **[Refactor]** 型の整理・ドキュメント追加

### 3.2 ストレージユーティリティ（2時間）

#### タスク
- [x] **[Red]** `lib/storage.test.ts` 作成
  - LocalStorage保存テスト
  - LocalStorage読み込みテスト
  - エラーハンドリングテスト
- [x] **[Green]** `lib/storage.ts` 実装
  - `saveToLocalStorage(key, data)`
  - `loadFromLocalStorage(key)`
  - エラーハンドリング
- [x] **[Refactor]** リファクタリング

### 3.3 記事管理ロジック（3時間）

#### タスク
- [x] **[Red]** `lib/articles.test.ts` 作成
  - ランダム記事取得テスト
  - カテゴリー別記事取得テスト
  - ID検索テスト
  - カテゴリー一覧取得テスト
- [x] **[Green]** `lib/articles.ts` 実装
  - `getRandomArticle(articles, excludeIds?)`
  - `getArticlesByCategory(articles, category)`
  - `getArticleById(articles, id)`
  - `getAllCategories(articles)`
- [x] **[Refactor]** リファクタリング

### 完了条件
- ✅ 全テストパス
- ✅ コードカバレッジ80%以上
- ✅ ESLintエラーなし

---

## Phase 4: 状態管理実装（予定工数: 4時間）

### 目的
Zustandを使った状態管理をTDDで実装。

### タスク
- [x] **[Red]** `store/useStore.test.ts` 作成
  - 初期状態テスト
  - loadArticles()テスト
  - markAsRead()テスト
  - isArticleRead()テスト
  - getRandomUnreadArticle()テスト
  - setCurrentArticle()テスト
  - setCategoryFilter()テスト
  - getFilteredArticles()テスト
- [x] **[Green]** `store/useStore.ts` 実装
  - Zustand store作成
  - persist middleware設定（readHistory, categoryFilterを永続化）
  - 各アクション実装
- [x] **[Refactor]** リファクタリング

### 完了条件
- ✅ 全テストパス
- ✅ コードカバレッジ80%以上
- ✅ LocalStorage永続化動作確認

---

## Phase 5: UIコンポーネント実装（予定工数: 10時間）

### 目的
ユーザーインターフェースを段階的に実装。

### 5.1 共通コンポーネント（4時間）

#### ReadCheckbox
- [x] **[Red]** コンポーネントテスト作成
- [x] **[Green]** 実装
- [x] **[Refactor]** disabled状態のハンドリング改善

#### ArticleCard
- [x] **[Red]** コンポーネントテスト作成
- [x] **[Green]** 実装（full/compact variant）
- [x] **[Refactor]** クリックイベント伝播制御

#### Navigation
- [x] **[Red]** コンポーネントテスト作成
- [x] **[Green]** 実装
- [x] **[Refactor]** usePathnameでアクティブ状態管理

#### CategoryFilter
- [x] **[Red]** コンポーネントテスト作成
- [x] **[Green]** 実装
- [x] **[Refactor]** アクティブ状態のスタイリング

#### PageTransition
- [x] **[Red]** コンポーネントテスト作成
- [x] **[Green]** 実装（Framer Motion）
- [x] **[Refactor]** フェード&スライドアニメーション

### 5.2 ページコンポーネント（6時間）

#### Home (`app/page.tsx`)
- [x] **[Red]** ページテスト作成
- [x] **[Green]** 実装
  - ランダム記事表示
  - 読了チェック
  - 次の記事ボタン
- [x] **[Refactor]** useEffect依存関係最適化

#### Archive (`app/archive/page.tsx`)
- [x] **[Red]** ページテスト作成
- [x] **[Green]** 実装
  - 記事一覧表示
  - ソート機能（新しい順/古い順）
  - 読了状態表示
- [x] **[Refactor]** ソート処理最適化

#### Categories (`app/categories/page.tsx`)
- [x] **[Red]** ページテスト作成
- [x] **[Green]** 実装
  - カテゴリー一覧
  - カテゴリー別フィルタリング
- [x] **[Refactor]** テスト修正（getAllByText対応）

#### Layout (`app/layout.tsx`)
- [x] **[Red]** レイアウトテスト作成
- [x] **[Green]** 実装
  - グローバルレイアウト
  - メタデータ設定（日本語タイトル・説明）
  - フォント設定（Geist Sans/Mono）
  - Navigation統合
- [x] **[Refactor]** テスト改善（lang属性確認方法）

### 完了条件
- ✅ 全コンポーネントテストパス
- ✅ レスポンシブデザイン確認（3サイズ）
- ✅ アニメーションスムーズ（60fps）

---

## Phase 6: 統合・デプロイ（予定工数: 4時間）

### 目的
全体統合、テスト、デプロイ準備。

### 6.1 統合テスト（2時間）

#### タスク（両バージョンテスト）
- [ ] プライベート版テスト（ローカル環境）
  - [ ] `data/articles-private.json`を`public/articles.json`にコピー
  - [ ] 開発サーバーで動作確認（`npm run dev`）
  - [ ] 全ページ遷移テスト
  - [ ] 読了履歴の永続化確認
  - [ ] オフライン動作確認
- [ ] パブリック版テスト（本番想定）
  - [ ] `data/articles-public.json`を`public/articles.json`にコピー
  - [ ] ビルド実行（`npm run build:public`）
  - [ ] 全ページ遷移テスト
  - [ ] 読了履歴の永続化確認
  - [ ] オフライン動作確認

### 6.2 デザイン調整（1時間）

#### タスク
- [ ] カラーパレット最終調整
- [ ] フォント調整
- [ ] アニメーション微調整
- [ ] レスポンシブ最終確認

### 6.3 ビルド・デプロイ（1時間）

#### タスク
- [ ] パブリック版ビルド（本番公開用）
  - [ ] `npm run build:public` 実行
  - [ ] 静的エクスポート確認（`out/`ディレクトリ）
  - [ ] Lighthouseスコア確認（目標90点以上）
  - [ ] Vercelにデプロイ
  - [ ] 本番環境動作確認
- [ ] プライベート版セットアップ（ローカル用）
  - [ ] ローカル環境用のREADME作成
  - [ ] `npm run dev`での起動手順確認

### 完了条件
- ✅ プライベート版: ローカルで正常動作
- ✅ パブリック版: 全機能が正常動作
- ✅ パブリック版: Lighthouseスコア90点以上
- ✅ パブリック版: 本番環境でアクセス可能
- ✅ データファイル切り替えが正常に動作

---

## Phase 7: PWA化（予定工数: 3時間）

### 目的
ホーム画面へのアプリ追加を可能にし、よりアプリライクな体験を提供する。

### 7.1 next-pwaセットアップ（1時間）

#### タスク
- [ ] **パッケージインストール**
  ```bash
  npm install next-pwa
  ```

- [ ] **next.config.js作成・設定**
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

- [ ] **.gitignore更新**
  ```
  # PWA files
  public/sw.js
  public/workbox-*.js
  public/worker-*.js
  public/fallback-*.js
  ```

### 7.2 マニフェスト・アイコン作成（1時間）

#### タスク
- [ ] **manifest.json作成**（`public/manifest.json`）
  - アプリ名、説明、アイコン、テーマカラー設定
  - スタンドアロンモード設定

- [ ] **アイコン画像準備**
  - `public/icons/icon-192x192.png`（192x192px）
  - `public/icons/icon-512x512.png`（512x512px）
  - シンプルで認識しやすいデザイン

- [ ] **app/layout.tsx メタデータ更新**
  - manifest リンク追加
  - theme-color設定
  - apple-mobile-web-app設定

### 7.3 動作確認・調整（1時間）

#### タスク
- [ ] **ローカル確認**
  ```bash
  npm run build
  npm run start
  ```
  - Lighthouse PWAスコア確認（目標90点以上）
  - 「ホーム画面に追加」ボタン表示確認
  - Service Worker登録確認

- [ ] **デプロイ後確認**
  - モバイルで「ホーム画面に追加」動作確認
  - スタンドアロンモード表示確認
  - オフライン動作確認
  - アイコン表示確認

### 完了条件
- ✅ next-pwa正常動作
- ✅ manifest.json正しく設定
- ✅ アイコン画像準備完了
- ✅ Lighthouse PWAスコア90点以上
- ✅ ホーム画面追加が正常動作
- ✅ スタンドアロンモードで表示

---

## マイルストーン

### Milestone 1: データ準備完了（Day 1-2）
- Phase 1-2完了
- 500記事以上のデータ取得・要約完了

### Milestone 2: コア実装完了（Day 3-4）
- Phase 3-4完了
- ロジック・状態管理が完成、テストパス

### Milestone 3: UI実装完了（Day 5-6）
- Phase 5完了
- 全ページ・コンポーネントが実装済み

### Milestone 4: リリース（Day 7）
- Phase 6完了
- 本番公開

---

## リスクと対策

### リスク1: Gmail API制限
- **対策**: バッチ処理を50件ごとに分割、適切な待機時間設定

### リスク2: 要約処理時間
- **対策**: 並列処理、Gemini Flash使用（高速）

### リスク3: データ容量
- **対策**: IndexedDB導入検討（5MB超の場合）

### リスク4: デザイン調整時間
- **対策**: Tailwind CSSでプロトタイプ高速化

---

## 開発環境

### 必須ツール
- Node.js 18.x以上
- npm 9.x以上
- VSCode（推奨）
- Chrome DevTools

### 推奨VSCode拡張機能
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Jest Runner

---

## 進捗管理

### 日次チェック項目
- [ ] その日のPhaseタスク完了
- [ ] 全テストパス確認
- [ ] コミット・プッシュ実行
- [ ] 翌日の作業計画確認

### 週次チェック項目
- [ ] マイルストーン達成状況確認
- [ ] スケジュール調整
- [ ] リスク再評価

---

## 完了基準（Definition of Done）

### 機能面
- ✅ 500記事以上が表示可能
- ✅ ランダム記事表示機能動作
- ✅ 読了チェック機能動作
- ✅ カテゴリーフィルター動作
- ✅ オフライン動作確認

### 品質面
- ✅ 全テストパス
- ✅ コードカバレッジ80%以上
- ✅ Lighthouseスコア90点以上
- ✅ ESLintエラーゼロ

### デザイン面
- ✅ レスポンシブ対応（3サイズ）
- ✅ アニメーションスムーズ（60fps）
- ✅ 読みやすいフォント・配色

### デプロイ面
- ✅ 本番環境でアクセス可能
- ✅ 独自ドメイン設定（オプション）

---

## 変更履歴

### 2025-10-20 - v1.1 機能改善
**実装者**: クロ

#### 変更内容
1. **アーカイブページ削除**
   - `/app/archive` を削除
   - カテゴリーページに統合

2. **カテゴリーページ機能強化**
   - 記事タイトルクリックで本文展開/折りたたみ機能追加
   - 記事番号表示機能追加（日付古い順に通し番号）
   - ソート順改善: 各カテゴリ内でお気に入り優先 → 番号昇順

3. **ナビゲーション簡素化**
   - アーカイブリンク削除
   - ホーム・カテゴリーの2ページ構成に

4. **データ構造変更**
   - Article型に`number`フィールド追加（オプション）
   - 表示時に動的採番する設計

#### 影響範囲
- `app/categories/page.tsx`: 展開機能・ソート機能追加
- `components/Navigation.tsx`: アーカイブリンク削除
- `components/ArticleCard.tsx`: 番号表示プロパティ追加
- `types/index.ts`: Article型定義更新
- `lib/articles.ts`: 番号採番・ソート関数追加

#### テスト状況
- ✅ 基本動作確認完了（手動テスト）
- ✅ 番号表示機能実装完了
- ✅ ソート機能実装完了

---

### 2025-10-20 - v1.2 カテゴリー非表示機能
**実装者**: クロ

#### 変更内容
1. **非表示カテゴリー設定**
   - お知らせ（2件）
   - イベント告知（1件）
   - 情報共有（1件）
   - 販売会案内（1件）
   - 合計5件を非表示化

2. **データ構造変更**
   - Article型に`hidden`フィールド追加（オプション）
   - `hidden: true` の記事はどこにも表示されない

3. **フィルター処理追加**
   - `loadArticles()`: 読み込み時に非表示記事を自動除外
   - `getRandomArticle()`: ランダム取得時に非表示記事を除外
   - カテゴリーフィルターでも非表示記事は表示されない

#### 実装ファイル
- `types/index.ts`: `hidden?: boolean` フィールド追加
- `public/articles.json`: 非表示カテゴリーの5記事に`hidden: true`設定
- `store/useStore.ts`: フィルター処理に非表示除外ロジック追加

#### 表示記事数
- **表示**: 1,153件（7カテゴリー）
  - マインドセット: 371件
  - 行動力: 275件
  - 自己受容: 165件
  - 目標設定: 131件
  - 習慣形成: 100件
  - 人間関係: 82件
  - 感謝: 29件
- **非表示**: 5件（4カテゴリー）
  - お知らせ、イベント告知、情報共有、販売会案内

#### テスト状況
- ✅ 動作確認完了（手動テスト）
- ✅ カテゴリーページで非表示カテゴリーが表示されないことを確認
- ✅ ホームページでランダム記事取得時に非表示記事が除外されることを確認

---

### 2025-10-20 - v1.3 スクロール機能改善
**実装者**: クロ

#### 変更内容
1. **ホームページのスクロール動作追加**
   - 「次の記事」ボタンクリック時に画面トップまでスムーズスクロール
   - 実装方法: `window.scrollTo({ top: 0, behavior: 'smooth' })`

#### 実装ファイル
- `app/page.tsx`: 次の記事ボタンのハンドラーにスクロール処理追加

#### テスト状況
- ✅ 実装完了
- ✅ コンパイル成功確認

---

**承認**: □ あおいさん
**作成者**: クロ
**次のステップ**: 動作確認
