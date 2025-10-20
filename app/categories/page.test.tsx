/**
 * Categoriesページのテスト
 */

import { render, screen, fireEvent } from '@testing-library/react';
import Categories from './page';
import { useStore } from '@/store/useStore';
import { Article } from '@/types';

// Zustand storeをモック
jest.mock('@/store/useStore');

const mockArticles: Article[] = [
  {
    id: 'article-1',
    title: 'マインドセット記事1',
    content: '本文1',
    category: 'マインドセット',
    date: '2023-01-01',
    originalDate: '2023-01-01',
    createdAt: '2025-10-19T12:00:00Z',
    tags: ['テスト']
  },
  {
    id: 'article-2',
    title: '習慣形成記事1',
    content: '本文2',
    category: '習慣形成',
    date: '2023-01-02',
    originalDate: '2023-01-02',
    createdAt: '2025-10-19T12:00:00Z',
    tags: ['テスト']
  },
  {
    id: 'article-3',
    title: 'マインドセット記事2',
    content: '本文3',
    category: 'マインドセット',
    date: '2023-01-03',
    originalDate: '2023-01-03',
    createdAt: '2025-10-19T12:00:00Z',
    tags: ['テスト']
  }
];

describe('Categories', () => {
  const mockLoadArticles = jest.fn();
  const mockGetFilteredArticles = jest.fn();
  const mockSetCategoryFilter = jest.fn();
  const mockSetCurrentArticle = jest.fn();
  const mockToggleFavorite = jest.fn();
  const mockIsFavorite = jest.fn();

  beforeEach(() => {
    // モックのリセット
    jest.clearAllMocks();

    // useStoreのモック設定
    (useStore as unknown as jest.Mock).mockReturnValue({
      articles: mockArticles,
      categoryFilter: null,
      loadArticles: mockLoadArticles,
      getFilteredArticles: mockGetFilteredArticles,
      setCategoryFilter: mockSetCategoryFilter,
      setCurrentArticle: mockSetCurrentArticle,
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite
    });

    // global.fetch のモック
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockArticles)
      })
    ) as jest.Mock;

    // デフォルトで全記事を返す
    mockGetFilteredArticles.mockReturnValue(mockArticles);
    mockIsFavorite.mockReturnValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ページタイトルが表示される', () => {
    render(<Categories />);

    expect(screen.getByText('カテゴリー')).toBeInTheDocument();
  });

  it('CategoryFilterコンポーネントが表示される', () => {
    render(<Categories />);

    expect(screen.getByText('全て')).toBeInTheDocument();
    // getAllByTextで複数マッチする場合も取得可能
    expect(screen.getAllByText('マインドセット').length).toBeGreaterThan(0);
    expect(screen.getAllByText('習慣形成').length).toBeGreaterThan(0);
  });

  it('カテゴリーフィルタークリックでsetCategoryFilterが呼ばれる', () => {
    render(<Categories />);

    // ボタンを特定するため、getAllByTextで取得して最初の要素（フィルターボタン）をクリック
    const categoryButtons = screen.getAllByText('マインドセット');
    const filterButton = categoryButtons.find(el => el.tagName === 'BUTTON');

    if (filterButton) {
      fireEvent.click(filterButton);
    }

    expect(mockSetCategoryFilter).toHaveBeenCalledWith('マインドセット');
  });

  it('フィルター済み記事が表示される', () => {
    const filteredArticles = mockArticles.filter(
      a => a.category === 'マインドセット'
    );
    mockGetFilteredArticles.mockReturnValue(filteredArticles);

    (useStore as unknown as jest.Mock).mockReturnValue({
      articles: mockArticles,
      categoryFilter: 'マインドセット',
      loadArticles: mockLoadArticles,
      getFilteredArticles: mockGetFilteredArticles,
      setCategoryFilter: mockSetCategoryFilter,
      setCurrentArticle: mockSetCurrentArticle,
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite
    });

    render(<Categories />);

    expect(screen.getByText('マインドセット記事1')).toBeInTheDocument();
    expect(screen.getByText('マインドセット記事2')).toBeInTheDocument();
    expect(screen.queryByText('習慣形成記事1')).not.toBeInTheDocument();
  });

  it('「全て」クリックでsetCategoryFilterがnullで呼ばれる', () => {
    (useStore as unknown as jest.Mock).mockReturnValue({
      articles: mockArticles,
      categoryFilter: 'マインドセット',
      loadArticles: mockLoadArticles,
      getFilteredArticles: mockGetFilteredArticles,
      setCategoryFilter: mockSetCategoryFilter,
      setCurrentArticle: mockSetCurrentArticle,
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite
    });

    render(<Categories />);

    const allButton = screen.getByText('全て');
    fireEvent.click(allButton);

    expect(mockSetCategoryFilter).toHaveBeenCalledWith(null);
  });

  it('記事カードクリックでsetCurrentArticleが呼ばれる', () => {
    render(<Categories />);

    const firstCard = screen.getAllByTestId('article-card')[0];
    fireEvent.click(firstCard);

    expect(mockSetCurrentArticle).toHaveBeenCalled();
  });


  it('記事がない場合、メッセージを表示', () => {
    mockGetFilteredArticles.mockReturnValue([]);

    render(<Categories />);

    expect(screen.getByText(/記事がありません/)).toBeInTheDocument();
  });
});
