/**
 * 記事管理ロジック
 */

import { Article } from '@/types';

/**
 * ランダムに記事を1つ取得
 *
 * @param articles - 記事配列
 * @param excludeIds - 除外する記事IDリスト（オプション）
 * @returns ランダムに選ばれた記事、該当なしの場合null
 */
export function getRandomArticle(
  articles: Article[],
  excludeIds?: string[]
): Article | null {
  // 除外IDを考慮してフィルタリング
  const availableArticles = excludeIds
    ? articles.filter(article => !excludeIds.includes(article.id))
    : articles;

  // 記事がない場合はnull
  if (availableArticles.length === 0) {
    return null;
  }

  // ランダムインデックスで記事を選択
  const randomIndex = Math.floor(Math.random() * availableArticles.length);
  return availableArticles[randomIndex];
}

/**
 * カテゴリー別に記事を取得
 *
 * @param articles - 記事配列
 * @param category - カテゴリー名
 * @returns カテゴリーに一致する記事配列
 */
export function getArticlesByCategory(
  articles: Article[],
  category: string
): Article[] {
  return articles.filter(article => article.category === category);
}

/**
 * IDで記事を検索
 *
 * @param articles - 記事配列
 * @param id - 記事ID
 * @returns IDに一致する記事、見つからない場合null
 */
export function getArticleById(articles: Article[], id: string): Article | null {
  const article = articles.find(article => article.id === id);
  return article || null;
}

/**
 * 全カテゴリー一覧を取得（重複なし・ソート済み）
 *
 * @param articles - 記事配列
 * @returns カテゴリー名配列（ソート済み）
 */
export function getAllCategories(articles: Article[]): string[] {
  // Setで重複除去
  const categories = Array.from(
    new Set(articles.map(article => article.category))
  );

  // ソートして返す
  return categories.sort();
}

/**
 * 記事に通し番号を付与（日付昇順）
 * 非表示記事を除外してから番号を振る
 *
 * @param articles - 記事配列
 * @returns 番号付き記事配列（元の配列は変更しない）
 */
export function addArticleNumbers(articles: Article[]): Article[] {
  // 非表示記事を除外
  const visibleArticles = articles.filter(article => !article.hidden);

  // 日付昇順でソート
  const sorted = [...visibleArticles].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // 通し番号を付与
  return sorted.map((article, index) => ({
    ...article,
    number: index + 1
  }));
}

/**
 * カテゴリー内でソート（お気に入り優先 → 番号昇順）
 *
 * @param articles - 記事配列（番号付き）
 * @param favorites - お気に入りリスト
 * @returns ソート済み記事配列
 */
export function sortArticlesInCategory(
  articles: Article[],
  favorites: string[]
): Article[] {
  return [...articles].sort((a, b) => {
    const aIsFavorite = favorites.includes(a.id);
    const bIsFavorite = favorites.includes(b.id);

    // お気に入り優先
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;

    // 同じお気に入り状態なら番号昇順
    return (a.number || 0) - (b.number || 0);
  });
}
