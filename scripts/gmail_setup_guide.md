# Gmail MCP Server セットアップガイド

このガイドでは、Gmail APIを使用してメールデータを収集するための設定手順を説明します。

---

## Step 1: Google Cloud Platform プロジェクト作成

### 1.1 Google Cloud Consoleにアクセス

1. ブラウザで [Google Cloud Console](https://console.cloud.google.com/) を開く
2. Googleアカウントでログイン

### 1.2 新しいプロジェクトを作成

1. 画面上部の「プロジェクトを選択」をクリック
2. 「新しいプロジェクト」をクリック
3. プロジェクト名: `chuusinjiku-tracker` と入力
4. 「作成」をクリック

### 1.3 プロジェクトを選択

作成したプロジェクト `chuusinjiku-tracker` を選択

---

## Step 2: Gmail API有効化

### 2.1 APIライブラリを開く

1. 左側メニュー → 「APIとサービス」 → 「ライブラリ」をクリック
2. 検索ボックスに `Gmail API` と入力
3. 「Gmail API」をクリック
4. 「有効にする」ボタンをクリック

---

## Step 3: OAuth 2.0認証情報の作成

### 3.1 認証情報ページを開く

1. 左側メニュー → 「APIとサービス」 → 「認証情報」をクリック
2. 「認証情報を作成」→ 「OAuth クライアント ID」を選択

### 3.2 同意画面の設定（初回のみ）

OAuth同意画面の設定を求められた場合：

1. 「同意画面を構成」をクリック
2. **ユーザータイプ**: 「外部」を選択して「作成」
3. **アプリ情報**:
   - アプリ名: `中心軸トラッカー`
   - ユーザーサポートメール: あなたのメールアドレス
4. **デベロッパーの連絡先情報**: あなたのメールアドレス
5. 「保存して次へ」をクリック
6. **スコープ**: 「スコープを追加または削除」をクリック
   - `https://www.googleapis.com/auth/gmail.readonly` を追加
   - 「更新」をクリック
7. 「保存して次へ」をクリック
8. **テストユーザー**: 「ADD USERS」をクリックしてあなたのGmailアドレスを追加
9. 「保存して次へ」をクリック
10. 「ダッシュボードに戻る」をクリック

### 3.3 OAuth クライアント IDの作成

1. 「認証情報を作成」→ 「OAuth クライアント ID」を再度選択
2. **アプリケーションの種類**: 「デスクトップ アプリ」を選択
3. **名前**: `chuusinjiku-desktop` と入力
4. 「作成」をクリック

### 3.4 認証情報のダウンロード

1. 作成された認証情報の右側にある「ダウンロード」アイコン（↓）をクリック
2. JSONファイルがダウンロードされる
3. ファイル名を `credentials.json` にリネーム
4. **重要**: このファイルは機密情報なので、絶対に公開しない

---

## Step 4: MCP Gmail Serverのインストール

### 4.1 リポジトリのクローン

```bash
cd ~/.local/lib/mcp-servers/
git clone https://github.com/jeremyjordan/mcp-gmail.git gmail
cd gmail
```

### 4.2 仮想環境の作成とパッケージインストール

```bash
python3 -m venv venv
source venv/bin/activate
pip install -e .
```

### 4.3 認証情報の配置

```bash
# ダウンロードした credentials.json を配置
cp ~/Downloads/credentials.json ~/.local/lib/mcp-servers/gmail/credentials.json
```

---

## Step 5: Claude Code設定の更新

### 5.1 設定ファイルの場所

Claude CodeのMCP設定ファイル:
- **Linux/WSL**: `~/.config/Claude/claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### 5.2 設定の追加

`claude_desktop_config.json` を開いて、以下を追加：

```json
{
  "mcpServers": {
    "gmail": {
      "command": "/home/ustar-wsl-2-2/.local/lib/mcp-servers/gmail/venv/bin/python",
      "args": [
        "-m",
        "mcp_gmail"
      ],
      "env": {
        "GMAIL_CREDENTIALS_PATH": "/home/ustar-wsl-2-2/.local/lib/mcp-servers/gmail/credentials.json",
        "GMAIL_TOKEN_PATH": "/home/ustar-wsl-2-2/.local/lib/mcp-servers/gmail/token.json"
      }
    }
  }
}
```

**重要**: パスは実際の環境に合わせて調整してください。

### 5.3 Claude Codeの再起動

設定を反映するため、Claude Codeを再起動してください。

---

## Step 6: OAuth認証の実行

### 6.1 初回認証

Claude Codeで以下のコマンドを実行：

```
Gmailに接続してください
```

ブラウザが開き、Googleアカウントの認証画面が表示されます：

1. あなたのGoogleアカウントを選択
2. 「このアプリは確認されていません」と表示される場合:
   - 「詳細」をクリック
   - 「〜（安全ではないページ）に移動」をクリック
3. 権限の確認画面で「許可」をクリック
4. 認証が完了すると、`token.json` が自動生成される

### 6.2 認証の確認

認証が成功したか確認：

```bash
ls -la ~/.local/lib/mcp-servers/gmail/token.json
```

ファイルが存在すれば認証成功です。

---

## Step 7: 動作確認

Claude Codeで以下のコマンドを試してみましょう：

```
Gmailの受信トレイから最新5件のメール件名を取得してください
```

メールの件名が表示されれば、セットアップ完了です！

---

## トラブルシューティング

### 問題1: `credentials.json` が見つからない

**エラー**: `FileNotFoundError: credentials.json not found`

**解決策**:
```bash
# パスが正しいか確認
ls -la ~/.local/lib/mcp-servers/gmail/credentials.json

# 見つからない場合は再度配置
cp ~/Downloads/credentials.json ~/.local/lib/mcp-servers/gmail/credentials.json
```

### 問題2: 認証画面が開かない

**解決策**:
1. Claude Codeを完全に再起動
2. `~/.config/Claude/claude_desktop_config.json` の設定を再確認
3. パスが絶対パスになっているか確認

### 問題3: 「このアプリは確認されていません」警告

**これは正常です**:
- 個人用プロジェクトのため、Googleの審査を受けていない
- 「詳細」→「移動」で進めてOK
- 自分のアプリなので安全

### 問題4: `token.json` が生成されない

**解決策**:
```bash
# 権限を確認
chmod 755 ~/.local/lib/mcp-servers/gmail/

# 手動で認証を再実行
cd ~/.local/lib/mcp-servers/gmail/
source venv/bin/activate
python -m mcp_gmail
```

---

## セキュリティ上の注意

### 機密ファイルの管理

以下のファイルは**絶対に公開しない**でください：

- `credentials.json` - OAuth クライアントの認証情報
- `token.json` - アクセストークン

### .gitignoreの設定

プロジェクトの `.gitignore` に追加（既に設定済み）：

```
# Gmail認証情報
credentials.json
token.json
```

---

## 次のステップ

セットアップが完了したら、以下のドキュメントを参照してデータ収集を開始してください：

- [Gmail収集方法提案書](../doc/gmail_collection_proposal.md)
- [実装計画書 Phase 1](../doc/implementation_plan_v1.0.md#phase-1-データ収集予定工数-4時間)

---

**参考リンク**:
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [mcp-gmail GitHub Repository](https://github.com/jeremyjordan/mcp-gmail)
- [Google Cloud Console](https://console.cloud.google.com/)
