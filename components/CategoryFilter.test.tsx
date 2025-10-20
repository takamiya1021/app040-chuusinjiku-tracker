/**
 * CategoryFilterコンポーネントのテスト
 */

import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFilter from './CategoryFilter';

const mockCategories = [
  'マインドセット',
  '習慣形成',
  '目標設定',
  '自己受容',
  '感謝'
];

describe('CategoryFilter', () => {
  it('全てのカテゴリーが表示される', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={() => {}}
      />
    );

    mockCategories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('「全て」ボタンが表示される', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={() => {}}
      />
    );

    expect(screen.getByText('全て')).toBeInTheDocument();
  });

  it('選択されたカテゴリーがアクティブスタイルになる', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="マインドセット"
        onCategoryChange={() => {}}
      />
    );

    const activeButton = screen.getByText('マインドセット');
    expect(activeButton).toHaveClass('bg-blue-600');
    expect(activeButton).toHaveClass('text-white');
  });

  it('selectedCategoryがnullの時、「全て」がアクティブになる', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={() => {}}
      />
    );

    const allButton = screen.getByText('全て');
    expect(allButton).toHaveClass('bg-blue-600');
    expect(allButton).toHaveClass('text-white');
  });

  it('非アクティブなカテゴリーは通常スタイルになる', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="マインドセット"
        onCategoryChange={() => {}}
      />
    );

    const inactiveButton = screen.getByText('習慣形成');
    expect(inactiveButton).toHaveClass('bg-gray-100');
    expect(inactiveButton).not.toHaveClass('bg-blue-600');
  });

  it('カテゴリークリック時にonCategoryChangeが呼ばれる', () => {
    const handleChange = jest.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={handleChange}
      />
    );

    const categoryButton = screen.getByText('マインドセット');
    fireEvent.click(categoryButton);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('マインドセット');
  });

  it('「全て」クリック時にonCategoryChangeがnullで呼ばれる', () => {
    const handleChange = jest.fn();
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="マインドセット"
        onCategoryChange={handleChange}
      />
    );

    const allButton = screen.getByText('全て');
    fireEvent.click(allButton);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('カテゴリーが空配列の場合、「全て」のみ表示される', () => {
    render(
      <CategoryFilter
        categories={[]}
        selectedCategory={null}
        onCategoryChange={() => {}}
      />
    );

    expect(screen.getByText('全て')).toBeInTheDocument();
    expect(screen.queryByText('マインドセット')).not.toBeInTheDocument();
  });
});
