/**
 * カテゴリーページ
 * カテゴリー別に記事を表示
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useArticles } from '@/hooks/useArticles';
import { getAllCategories, addArticleNumbers, sortArticlesInCategory, getArticlesByCategory } from '@/lib/articles';
import ArticleCard from '@/components/ArticleCard';
import CategoryFilter from '@/components/CategoryFilter';
import PageTransition from '@/components/PageTransition';

export default function Categories() {
  const {
    articles,
    categoryFilter,
    favorites,
    setCategoryFilter,
    toggleFavorite,
    isFavorite
  } = useStore();

  // 記事データ読み込み（共通hooks使用）
  useArticles();

  // 展開中の記事IDを管理
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  // 初回表示時のお気に入りを保持（ソートはこれを基準にする）
  const [initialFavoriteIds, setInitialFavoriteIds] = useState<string[]>([]);

  // 表示件数を管理（初期50件）
  const [displayCount, setDisplayCount] = useState<number>(50);
  const LOAD_MORE_COUNT = 50; // 「もっと見る」で追加する件数

  // 記事に番号を付与（キャッシュ）
  const articlesWithNumbers = useMemo(() => addArticleNumbers(articles), [articles]);

  // カテゴリー一覧を取得（キャッシュ）
  const categories = useMemo(() => getAllCategories(articles), [articles]);

  // フィルター済み記事を取得（キャッシュ）
  const filteredArticles = useMemo(() => {
    if (!categoryFilter) {
      return articles;
    }
    return getArticlesByCategory(articles, categoryFilter);
  }, [articles, categoryFilter]);

  // フィルター済み記事に番号を付与（キャッシュ）
  const filteredWithNumbers = useMemo(() => {
    return filteredArticles.map(article => {
      const withNumber = articlesWithNumbers.find(a => a.id === article.id);
      return withNumber || article;
    });
  }, [filteredArticles, articlesWithNumbers]);

  // ソート適用（初回表示時のお気に入り状態を基準に・キャッシュ）
  const sortedArticles = useMemo(() => {
    return sortArticlesInCategory(filteredWithNumbers, initialFavoriteIds);
  }, [filteredWithNumbers, initialFavoriteIds]);

  // 表示する記事（件数制限）
  const displayedArticles = useMemo(() => {
    return sortedArticles.slice(0, displayCount);
  }, [sortedArticles, displayCount]);

  // まだ表示できる記事があるか
  const hasMore = displayCount < sortedArticles.length;

  // 初回表示時とカテゴリー変更時に、その時点のお気に入りIDを保存
  useEffect(() => {
    const favoriteIds = favorites.map(f => f.articleId);
    setInitialFavoriteIds(favoriteIds);
    // カテゴリー変更時は表示件数もリセット
    setDisplayCount(50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]); // カテゴリー変更時（タブ切り替え時）のみ更新

  // カテゴリー変更
  const handleCategoryChange = (category: string | null) => {
    setCategoryFilter(category);
    // カテゴリー変更時は展開をリセット
    setExpandedArticleId(null);
  };

  // もっと見るボタン
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + LOAD_MORE_COUNT);
  };

  // 記事カードクリック（展開/折りたたみトグル）
  const handleArticleClick = (articleId: string) => {
    if (expandedArticleId === articleId) {
      // 既に展開中の記事をクリック → 折りたたむ
      setExpandedArticleId(null);
    } else {
      // 別の記事をクリック → 展開
      setExpandedArticleId(articleId);
    }
  };

  // お気に入り状態変更
  const handleFavoriteChange = (articleId: string) => {
    toggleFavorite(articleId);
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            カテゴリー
          </h1>

          {/* カテゴリーフィルター */}
          <CategoryFilter
            categories={categories}
            selectedCategory={categoryFilter}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* 記事一覧 */}
        <div className="space-y-4 mt-6">
          {displayedArticles.length > 0 ? (
            <>
              {displayedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant={expandedArticleId === article.id ? 'full' : 'compact'}
                  isFavorite={isFavorite(article.id)}
                  onFavoriteChange={handleFavoriteChange}
                  onClick={handleArticleClick}
                  showNumber={true}
                />
              ))}

              {/* もっと見るボタン */}
              {hasMore && (
                <div className="text-center py-8">
                  <button
                    onClick={handleLoadMore}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    もっと見る（{displayCount} / {sortedArticles.length}件表示中）
                  </button>
                </div>
              )}

              {/* 全件表示完了メッセージ */}
              {!hasMore && sortedArticles.length > 50 && (
                <div className="text-center py-8 text-gray-600">
                  全{sortedArticles.length}件を表示中
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-gray-600">記事がありません</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
