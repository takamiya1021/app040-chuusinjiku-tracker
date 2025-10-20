/**
 * 読了チェックボックスコンポーネント
 */

import React from 'react';

interface ReadCheckboxProps {
  /** チェック状態 */
  checked: boolean;

  /** チェック状態変更時のコールバック */
  onChange: () => void;

  /** ラベルテキスト（デフォルト: 読了） */
  label?: string;

  /** 無効化フラグ */
  disabled?: boolean;
}

export default function ReadCheckbox({
  checked,
  onChange,
  label = '読了',
  disabled = false
}: ReadCheckboxProps) {
  const handleChange = () => {
    if (!disabled) {
      onChange();
    }
  };

  return (
    <label className="inline-flex items-center cursor-pointer gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <span className="text-sm font-medium text-gray-700 select-none">
        {label}
      </span>
    </label>
  );
}
