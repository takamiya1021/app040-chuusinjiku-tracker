/**
 * 記事カードコンポーネント
 */

import React from 'react';
import { Article } from '@/types';
import FavoriteButton from './FavoriteButton';

interface ArticleCardProps {
  /** 記事データ */
  article: Article;

  /** 表示バリアント（full: 全文表示、compact: コンパクト表示） */
  variant: 'full' | 'compact';

  /** お気に入り登録済みフラグ */
  isFavorite?: boolean;

  /** お気に入り状態変更時のコールバック */
  onFavoriteChange?: (articleId: string) => void;

  /** カードクリック時のコールバック */
  onClick?: (articleId: string) => void;

  /** 記事番号を表示するか */
  showNumber?: boolean;
}

export default function ArticleCard({
  article,
  variant,
  isFavorite = false,
  onFavoriteChange,
  onClick,
  showNumber = false
}: ArticleCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(article.id);
    }
  };

  const handleFavoriteChange = () => {
    if (onFavoriteChange) {
      onFavoriteChange(article.id);
    }
  };

  return (
    <div
      data-testid="article-card"
      onClick={handleCardClick}
      className={`
        bg-white rounded-lg shadow-md p-6 transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
      `}
    >
      {/* ヘッダー部分 */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {/* 記事番号（小さく表示） */}
            {showNumber && article.number && (
              <span className="text-xs text-gray-400 font-mono">
                #{article.number}
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900">
              {article.title}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {article.category}
            </span>
          </div>
        </div>

        {/* お気に入りボタン */}
        {onFavoriteChange && (
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton
              isFavorite={isFavorite}
              onChange={handleFavoriteChange}
            />
          </div>
        )}
      </div>

      {/* 本文（fullの場合のみ） */}
      {variant === 'full' && (
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      )}

      {/* タグ（あれば表示） */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {article.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
