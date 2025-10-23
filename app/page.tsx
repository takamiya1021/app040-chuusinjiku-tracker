/**
 * ホームページ
 * ランダムに記事を1つ表示
 */

'use client';

import React, { useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useArticles } from '@/hooks/useArticles';
import { addArticleNumbers } from '@/lib/articles';
import ArticleCard from '@/components/ArticleCard';
import PageTransition from '@/components/PageTransition';

export default function Home() {
  const {
    articles,
    currentArticle,
    loadArticles,
    getRandomArticle,
    setCurrentArticle,
    toggleFavorite,
    isFavorite
  } = useStore();

  // 記事データ読み込み（共通hooks使用）
  useArticles();

  // 記事に番号を付与
  const articlesWithNumbers = useMemo(() => addArticleNumbers(articles), [articles]);

  // 記事データ読み込み後、最初の記事を表示
  useEffect(() => {
    if (articles.length > 0 && !currentArticle) {
      const firstArticle = getRandomArticle();
      if (firstArticle) {
        setCurrentArticle(firstArticle);
      }
    }
  }, [articles, currentArticle, getRandomArticle, setCurrentArticle]);

  // 次の記事を表示
  const handleNextArticle = () => {
    const nextArticle = getRandomArticle();
    setCurrentArticle(nextArticle);

    // 画面トップまでスムーズスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // お気に入り状態変更
  const handleFavoriteChange = (articleId: string) => {
    toggleFavorite(articleId);
  };

  // 現在の記事に番号を付与したバージョンを取得
  const currentArticleWithNumber = useMemo(() => {
    if (!currentArticle) return null;
    const withNumber = articlesWithNumbers.find(a => a.id === currentArticle.id);
    return withNumber || currentArticle;
  }, [currentArticle, articlesWithNumbers]);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            中心軸を整える
          </h1>
          <p className="text-gray-600">
            メンタルを整える習慣化アプリ
          </p>
        </div>

        {/* メインコンテンツ */}
        <div className="max-w-3xl mx-auto">
          {currentArticleWithNumber ? (
            <>
              {/* 記事カード */}
              <ArticleCard
                article={currentArticleWithNumber}
                variant="full"
                isFavorite={isFavorite(currentArticleWithNumber.id)}
                onFavoriteChange={handleFavoriteChange}
                showNumber={true}
              />

              {/* 次の記事ボタン */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleNextArticle}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  次の記事
                </button>
              </div>
            </>
          ) : (
            // ローディング中
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-gray-600">記事を読み込み中...</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
