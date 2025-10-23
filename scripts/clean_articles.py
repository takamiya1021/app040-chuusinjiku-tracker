#!/usr/bin/env python3
"""
記事データクリーニングスクリプト
- タイトルフィルタリング（「ご案内」「セミナー」を非表示）
- 本文冒頭の挨拶文削除
"""

import json
import re
from pathlib import Path


def should_hide_article(title: str) -> bool:
    """タイトルに基づいて非表示にすべきか判定"""
    hide_keywords = ["ご案内", "セミナー"]
    return any(keyword in title for keyword in hide_keywords)


def clean_greeting_lines(content: str) -> str:
    """本文冒頭の固有名詞（名前）を削除（挨拶は残す）"""
    lines = content.split('\n')

    # 冒頭50行を対象（挨拶が本文途中にある場合も対応）
    max_check = min(50, len(lines))

    cleaned_lines = []
    i = 0

    while i < len(lines):
        if i >= max_check:
            # 5行目以降はそのまま保持
            cleaned_lines.extend(lines[i:])
            break

        line = lines[i].strip()

        # 空行はそのまま保持（ただし挨拶の直後の空行は次の固有名詞チェック対象）
        if not line:
            cleaned_lines.append(lines[i])
            i += 1
            continue

        # 削除パターン（固有名詞のみ）
        should_delete = False

        # 1. 単独の「ヒロです」「太郎です」など
        if re.match(r'^[ぁ-んァ-ヶー一-龠]{1,8}です[。.]?$', line):
            should_delete = True

        # 2. 「ヒロさん、」など呼びかけのみの行
        elif re.match(r'^[ぁ-んァ-ヶー一-龠]{1,8}さん[、，]', line):
            should_delete = True

        # 3. 行頭から「〇〇です。」で始まるパターン（挨拶なし）
        # 「ヒロです。初めてインドの...」などに対応
        elif re.match(r'^[ぁ-んァ-ヶー一-龠]{1,8}です[、，。.！!？?]', line):
            # 固有名詞部分のみ削除して残りを保持
            cleaned_line = re.sub(r'^[ぁ-んァ-ヶー一-龠]{1,8}です[、，。.！!？?]\s*', '', line)
            if cleaned_line:  # 削除後に内容が残る場合のみ保持
                cleaned_lines.append(cleaned_line)
            # 削除後に何も残らない場合はshould_delete扱い（次のiへ）
            i += 1
            continue

        # 4. 挨拶パターン（句読点あり・なし）
        elif re.match(r'^(こんにちは|こんばんは|こんばんわ|おはようございます|新年あけましておめでとうございます|明けましておめでとうございます)', line):
            # 挨拶行を保持（固有名詞は削除）

            # 同じ行に固有名詞が続く場合を削除
            # 「おはようございます、ヒロです」「おはようございます！ヒロです。」等
            # すべての句読点に対応
            greeting_only = re.sub(r'[、，。.！!？?]\s*[ぁ-んァ-ヶー一-龠]{1,8}です[。.]?.*$', '', line)
            cleaned_lines.append(greeting_only)


            # 次の行以降をチェック（空行を挟む可能性も考慮）
            j = i + 1
            while j < max_check and j < len(lines):
                next_line = lines[j].strip()

                # 空行はスキップ
                if not next_line:
                    cleaned_lines.append(lines[j])
                    j += 1
                    continue

                # 固有名詞パターン
                if re.match(r'^[ぁ-んァ-ヶー一-龠]{1,8}です[。.]?$', next_line):
                    # 固有名詞は削除（cleaned_linesに追加しない）
                    j += 1
                    break
                else:
                    # 固有名詞以外の行が来たら終了
                    break

            i = j
            continue

        # 削除しない場合はそのまま保持
        if not should_delete:
            cleaned_lines.append(lines[i])

        i += 1

    return '\n'.join(cleaned_lines).strip()


def main():
    # ファイルパス
    input_file = Path("public/articles-app.json")
    output_file = Path("public/articles-app.json")

    # JSONファイル読み込み
    print(f"📖 読み込み中: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        articles = json.load(f)

    total_articles = len(articles)
    hidden_count = 0
    cleaned_count = 0

    print(f"✅ 記事数: {total_articles}件")
    print("\n🔧 処理開始...")

    # 各記事を処理
    for article in articles:
        title = article.get('title', '')
        content = article.get('content', '')

        # タイトルフィルタリング
        if should_hide_article(title):
            article['hidden'] = True
            hidden_count += 1
            print(f"  🚫 非表示: {title}")

        # 本文クリーニング
        original_content = content
        cleaned_content = clean_greeting_lines(content)

        if cleaned_content != original_content:
            article['content'] = cleaned_content
            cleaned_count += 1
            print(f"  ✂️  クリーニング: {title[:30]}...")

    # 結果を保存
    print(f"\n💾 保存中: {output_file}")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    # 処理結果サマリー
    print("\n" + "="*50)
    print("📊 処理結果")
    print("="*50)
    print(f"総記事数: {total_articles}件")
    print(f"非表示設定: {hidden_count}件")
    print(f"本文クリーニング: {cleaned_count}件")
    print(f"出力ファイル: {output_file}")
    print("="*50)


if __name__ == "__main__":
    main()
