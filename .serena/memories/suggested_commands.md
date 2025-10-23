# 推奨コマンド集

## 開発コマンド

### サーバー起動・停止
```bash
# 開発サーバー起動（tmux推奨）
tmux new-session -d -s dev-server "npm run dev -- --hostname 0.0.0.0"

# 開発サーバー起動（通常）
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start
```

### データバージョン切り替えビルド
```bash
# プライベート版でビルド
npm run build:private

# パブリック版でビルド
npm run build:public
```

## テストコマンド

```bash
# テスト実行
npm test

# テスト（watch モード）
npm run test:watch

# カバレッジ計測
npm run test:coverage
```

## 品質管理

```bash
# ESLint実行
npm run lint

# 型チェック
npx tsc --noEmit
```

## データ管理

```bash
# マスターを作業用にコピー
cp public/articles.json data/input.json

# 要約版作成（Gemini API使用）
python3 scripts/create_public_data.py

# 全文版に切り替え
cp public/articles.json public/articles-app.json

# 要約版に切り替え
cp public/short.json public/articles-app.json
```

## Git操作

```bash
# ステータス確認
git status

# 変更確認
git diff

# コミット
git add .
git commit -m "メッセージ"

# プッシュ
git push
```

## サーバー確認

```bash
# ポート確認（WSL2対応）
ss -tuln | grep :3000

# tmuxセッション一覧
tmux list-sessions

# WSL IPアドレス取得
hostname -I
```

## システムユーティリティ（Linux/WSL2）

```bash
# ファイル検索
find . -name "*.tsx"

# 内容検索
grep -r "キーワード" .

# ディレクトリ一覧
ls -la

# ディレクトリ移動
cd ~/projects/100apps/app040-chuusinjiku-tracker
```

## プロジェクト固有の注意点

### ポート番号
- 開発サーバー: 3000（バッティング時は30xx番台最大値+1）
- アクセス: `http://[WSL_IP]:3000`

### データファイル
- アプリが読み込むのは `public/articles-app.json`
- マスターファイル編集禁止
  - 全文版: public/articles.json（1158件、全ての基準）
  - 要約版: public/short.json（1158件のうち354件非表示、804件表示・クリーニング済み）
