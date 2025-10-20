/**
 * カテゴリーページ
 * カテゴリー別に記事を表示
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { getAllCategories, addArticleNumbers, sortArticlesInCategory } from '@/lib/articles';
import ArticleCard from '@/components/ArticleCard';
import CategoryFilter from '@/components/CategoryFilter';
import PageTransition from '@/components/PageTransition';

export default function Categories() {
  const {
    articles,
    categoryFilter,
    favorites,
    loadArticles,
    getFilteredArticles,
    setCategoryFilter,
    toggleFavorite,
    isFavorite
  } = useStore();

  // 展開中の記事IDを管理
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  // 初回表示時のお気に入りを保持（ソートはこれを基準にする）
  const [initialFavoriteIds, setInitialFavoriteIds] = useState<string[]>([]);

  // 記事に番号を付与
  const articlesWithNumbers = addArticleNumbers(articles);

  // フィルター済み記事を取得（番号付き）
  const filteredArticles = getFilteredArticles();
  const filteredWithNumbers = filteredArticles.map(article => {
    const withNumber = articlesWithNumbers.find(a => a.id === article.id);
    return withNumber || article;
  });

  // ソート適用（初回表示時のお気に入り状態を基準に）
  const sortedArticles = sortArticlesInCategory(filteredWithNumbers, initialFavoriteIds);

  // 初回読み込み時に記事データを取得
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/articles.json');
        if (response.ok) {
          const data = await response.json();
          loadArticles(data);
        }
      } catch (error) {
        console.error('Failed to load articles:', error);
      }
    };

    if (articles.length === 0) {
      fetchArticles();
    }
  }, [articles.length, loadArticles]);

  // カテゴリー一覧を取得
  const categories = getAllCategories(articles);

  // 初回表示時とカテゴリー変更時に、その時点のお気に入りIDを保存
  useEffect(() => {
    const favoriteIds = favorites.map(f => f.articleId);
    setInitialFavoriteIds(favoriteIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]); // カテゴリー変更時（タブ切り替え時）のみ更新

  // カテゴリー変更
  const handleCategoryChange = (category: string | null) => {
    setCategoryFilter(category);
    // カテゴリー変更時は展開をリセット
    setExpandedArticleId(null);
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
          {sortedArticles.length > 0 ? (
            sortedArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant={expandedArticleId === article.id ? 'full' : 'compact'}
                isFavorite={isFavorite(article.id)}
                onFavoriteChange={handleFavoriteChange}
                onClick={handleArticleClick}
                showNumber={true}
              />
            ))
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
