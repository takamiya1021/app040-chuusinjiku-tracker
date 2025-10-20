# 中心軸トラッカー

メンタルを整える習慣化アプリ

## 概要

心に響く文章を毎日1つずつ読むことで、メンタルを整え、人生のレベルを上げることを支援するアプリです。

## セットアップ

### 依存パッケージのインストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド

### プライベート版（ローカル用）

```bash
npm run build:private
```

### パブリック版（公開用）

```bash
npm run build:public
```

### デフォルトビルド（パブリック版）

```bash
npm run build
```

## テスト

### テスト実行

```bash
npm test
```

### ウォッチモード

```bash
npm run test:watch
```

### カバレッジレポート

```bash
npm run test:coverage
```

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **スタイリング**: Tailwind CSS
- **アニメーション**: Framer Motion
- **状態管理**: Zustand
- **テスト**: Jest + React Testing Library

## プロジェクト構造

```
app040-chuusinjiku-tracker/
├── app/                # Next.js App Router
├── components/         # 共通コンポーネント
├── lib/                # ユーティリティ関数
├── store/              # 状態管理（Zustand）
├── types/              # TypeScript型定義
├── data/               # データファイル（Git管理外）
├── public/             # 静的ファイル
└── doc/                # ドキュメント
```

## ドキュメント

- [要件定義書](doc/requirements_v1.0.md)
- [技術設計書](doc/technical_design_v1.0.md)
- [実装計画書](doc/implementation_plan_v1.0.md)
- [Gmail収集方法提案書](doc/gmail_collection_proposal.md)
- [2バージョン対応要約](doc/2version_summary.md)

## ライセンス

Private
