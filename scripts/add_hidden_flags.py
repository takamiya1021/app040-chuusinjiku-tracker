#!/usr/bin/env python3
"""
hidden フラグ付与スクリプト（順次処理版）
259件の事務連絡系記事に hidden: true を設定

重要: 各ステップ後に表示記事の通し番号を振り直す
"""

import json
import sys

# 除外カテゴリー（ステップ1: 5件）
EXCLUDED_CATEGORIES = ['お知らせ', 'イベント告知', '情報共有', '販売会案内']

# タイトルキーワード第1弾（ステップ2: 129件）
TITLE_KEYWORDS_STEP2 = ['年会費', 'アンティーク', 'Zoom', '募集', 'お詫び', '偽アカウント']

# 通し番号指定（ステップ3〜5: 21件）
EXCLUDED_NUMBERS_STEP3 = [230, 788, 797]
EXCLUDED_NUMBERS_STEP4 = [571, 915, 942, 967, 994]
EXCLUDED_NUMBERS_STEP5 = [698, 699, 700, 705, 713, 721, 723, 901, 935, 957, 964, 971, 1003]

# タイトルキーワード第2弾（ステップ6: 98件）
TITLE_KEYWORDS_STEP6 = ['会員サイト', 'ZOOM', '応援隊', '卒業生']

# 通し番号指定最終（ステップ7〜8: 4件）
EXCLUDED_NUMBERS_STEP8 = [461, 842, 843, 862]

def get_visible_articles(articles):
    """表示中の記事のみを抽出"""
    return [a for a in articles if not a.get('hidden', False)]

def assign_numbers(articles):
    """表示中の記事に通し番号を付与（辞書で返す: id -> 番号）"""
    visible = get_visible_articles(articles)
    return {article['id']: i + 1 for i, article in enumerate(visible)}

def add_hidden_flags(input_path: str, output_path: str):
    """hiddenフラグを順次処理で付与"""

    # データ読み込み
    with open(input_path, 'r', encoding='utf-8') as f:
        articles = json.load(f)

    print(f"総記事数: {len(articles)}件\n")

    # 日付順にソート
    sorted_articles = sorted(articles, key=lambda a: a.get('date', ''))

    # 全記事のhiddenフラグを初期化
    for article in sorted_articles:
        article['hidden'] = False

    hidden_by_step = {}

    # ステップ1: カテゴリー除外
    print("ステップ1: カテゴリー除外")
    step1_count = 0
    for article in sorted_articles:
        if article.get('category') in EXCLUDED_CATEGORIES:
            article['hidden'] = True
            step1_count += 1
    print(f"  除外: {step1_count}件")
    print(f"  残り: {len(get_visible_articles(sorted_articles))}件\n")
    hidden_by_step['Step1_カテゴリー'] = step1_count

    # ステップ2: タイトルキーワード第1弾
    print("ステップ2: タイトルキーワード第1弾")
    numbers = assign_numbers(sorted_articles)
    step2_count = 0
    for article in sorted_articles:
        if article.get('hidden'):
            continue
        title = article.get('title', '')
        for keyword in TITLE_KEYWORDS_STEP2:
            if keyword in title:
                article['hidden'] = True
                step2_count += 1
                break
    print(f"  除外: {step2_count}件")
    print(f"  残り: {len(get_visible_articles(sorted_articles))}件\n")
    hidden_by_step['Step2_キーワード第1弾'] = step2_count

    # ステップ3: 通し番号除外 (230, 788, 797)
    print("ステップ3: 通し番号除外 (230, 788, 797)")
    numbers = assign_numbers(sorted_articles)
    step3_count = 0
    for article in sorted_articles:
        if article.get('hidden'):
            continue
        article_num = numbers.get(article['id'])
        if article_num in EXCLUDED_NUMBERS_STEP3:
            article['hidden'] = True
            step3_count += 1
    print(f"  除外: {step3_count}件")
    print(f"  残り: {len(get_visible_articles(sorted_articles))}件\n")
    hidden_by_step['Step3_通し番号'] = step3_count

    # ステップ4: 通し番号除外 (571, 915, 942, 967, 994)
    print("ステップ4: 通し番号除外 (571, 915, 942, 967, 994)")
    numbers = assign_numbers(sorted_articles)
    step4_count = 0
    for article in sorted_articles:
        if article.get('hidden'):
            continue
        article_num = numbers.get(article['id'])
        if article_num in EXCLUDED_NUMBERS_STEP4:
            article['hidden'] = True
            step4_count += 1
    print(f"  除外: {step4_count}件")
    print(f"  残り: {len(get_visible_articles(sorted_articles))}件\n")
    hidden_by_step['Step4_通し番号'] = step4_count

    # ステップ5: 通し番号除外 (698-1003)
    print("ステップ5: 通し番号除外 (698-1003)")
    numbers = assign_numbers(sorted_articles)
    step5_count = 0
    for article in sorted_articles:
        if article.get('hidden'):
            continue
        article_num = numbers.get(article['id'])
        if article_num in EXCLUDED_NUMBERS_STEP5:
            article['hidden'] = True
            step5_count += 1
    print(f"  除外: {step5_count}件")
    print(f"  残り: {len(get_visible_articles(sorted_articles))}件\n")
    hidden_by_step['Step5_通し番号'] = step5_count

    # ステップ6: タイトルキーワード第2弾
    print("ステップ6: タイトルキーワード第2弾")
    numbers = assign_numbers(sorted_articles)
    step6_count = 0
    for article in sorted_articles:
        if article.get('hidden'):
            continue
        title = article.get('title', '')
        for keyword in TITLE_KEYWORDS_STEP6:
            if keyword in title:
                article['hidden'] = True
                step6_count += 1
                break
    print(f"  除外: {step6_count}件")
    print(f"  残り: {len(get_visible_articles(sorted_articles))}件\n")
    hidden_by_step['Step6_キーワード第2弾'] = step6_count

    # ステップ7-8: 通し番号除外 (461, 842, 843, 862)
    print("ステップ7-8: 通し番号除外 (461, 842, 843, 862)")
    numbers = assign_numbers(sorted_articles)
    step78_count = 0
    for article in sorted_articles:
        if article.get('hidden'):
            continue
        article_num = numbers.get(article['id'])
        if article_num in EXCLUDED_NUMBERS_STEP8:
            article['hidden'] = True
            step78_count += 1
    print(f"  除外: {step78_count}件")
    print(f"  残り: {len(get_visible_articles(sorted_articles))}件\n")
    hidden_by_step['Step7-8_通し番号'] = step78_count

    # 結果を保存
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(sorted_articles, f, ensure_ascii=False, indent=2)

    # 統計表示
    total_hidden = sum(1 for a in sorted_articles if a.get('hidden'))
    print(f"{'='*50}")
    print(f"✅ 処理完了")
    print(f"{'='*50}")
    print(f"総記事数: {len(sorted_articles)}件")
    print(f"非表示: {total_hidden}件")
    print(f"表示: {len(sorted_articles) - total_hidden}件")

    print(f"\n📊 ステップ別内訳:")
    for step, count in hidden_by_step.items():
        print(f"  {step}: {count}件")

    print(f"\n合計除外: {sum(hidden_by_step.values())}件")
    print(f"\n💾 保存完了: {output_path}")

if __name__ == "__main__":
    input_file = "data/articles-private.json"
    output_file = "data/articles-with-flags.json"

    add_hidden_flags(input_file, output_file)
