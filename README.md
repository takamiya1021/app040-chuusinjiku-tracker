# 中心軸トラッカー

> メンタルを整える記事閲覧アプリ

心に響く文章を毎日読むことで、メンタルを整え、人生のレベルを上げることを支援するPWAアプリです。

## ✨ 特徴

- 📱 **PWA対応** - スマホでもPCでも快適に閲覧可能
- 🎯 **カテゴリーフィルタリング** - 目的に合わせて記事を絞り込み
- ⚡ **高速表示** - Next.js 14の最適化による快適なブラウジング
- 🎨 **レスポンシブデザイン** - あらゆるデバイスに対応

## 🛠️ 技術スタック

- [Next.js 14](https://nextjs.org/) - React フレームワーク（App Router）
- [React 18](https://react.dev/) - UIライブラリ
- [TypeScript](https://www.typescriptlang.org/) - 型安全な開発
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストCSS
- [next-pwa](https://github.com/shadowwalker/next-pwa) - PWA対応

## 🚀 セットアップ

### 必要な環境

- Node.js 18.x 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/takamiya1021/app040-chuusinjiku-tracker.git
cd app040-chuusinjiku-tracker

# 依存パッケージをインストール
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### プロダクションビルド

```bash
npm run build
npm start
```

## 📁 プロジェクト構造

```
app040-chuusinjiku-tracker/
├── app/                # Next.js App Router
├── components/         # 共通コンポーネント
├── lib/                # ユーティリティ関数
├── store/              # 状態管理
├── types/              # TypeScript型定義
├── public/             # 静的ファイル・記事データ
│   ├── articles-app.json  # アプリが読み込む記事データ
│   └── short.json         # 要約版記事データ
├── scripts/            # データ処理スクリプト
└── doc/                # ドキュメント
```

## 📊 データ管理

記事データは2つのバージョンで管理されています：

- **全文版** (`articles.json`) - 完全な記事データ（1,158件、6.4MB）
- **要約版** (`short.json`) - クリーニング済み要約版（1,158件のうち354件非表示、804件表示、1.5MB）

アプリは `articles-app.json` を読み込むため、使用するバージョンを切り替えられます。

詳細は [doc/data.md](doc/data.md) を参照してください。

## 📝 主なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm start` | プロダクションサーバー起動 |
| `npm run lint` | ESLint実行 |

## 📄 ライセンス

MIT License

## 🔗 関連リンク

- [要件定義書](doc/requirements_v1.0.md)
- [技術設計書](doc/technical_design_v1.0.md)
- [データ管理ドキュメント](doc/data.md)
