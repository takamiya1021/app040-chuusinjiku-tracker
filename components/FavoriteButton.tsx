/**
 * お気に入りボタンコンポーネント
 */

import React from 'react';

interface FavoriteButtonProps {
  /** お気に入り登録済みフラグ */
  isFavorite: boolean;

  /** 状態変更時のコールバック */
  onChange: () => void;

  /** 無効化フラグ */
  disabled?: boolean;
}

export default function FavoriteButton({
  isFavorite,
  onChange,
  disabled = false
}: FavoriteButtonProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        text-2xl transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}
      `}
      aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      {isFavorite ? '❤' : '♡'}
    </button>
  );
}
