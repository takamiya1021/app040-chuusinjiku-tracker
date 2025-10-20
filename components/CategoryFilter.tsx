/**
 * カテゴリーフィルターコンポーネント
 */

import React from 'react';

interface CategoryFilterProps {
  /** カテゴリー一覧 */
  categories: string[];

  /** 選択中のカテゴリー（null = 全て） */
  selectedCategory: string | null;

  /** カテゴリー変更時のコールバック */
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* 「全て」ボタン */}
      <button
        onClick={() => onCategoryChange(null)}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        全て
      </button>

      {/* カテゴリーボタン */}
      {categories.map((category) => {
        const isActive = selectedCategory === category;

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
