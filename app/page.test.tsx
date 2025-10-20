/**
 * Homeページのテスト
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './page';
import { useStore } from '@/store/useStore';
import { Article } from '@/types';

// Zustand storeをモック
jest.mock('@/store/useStore');

const mockArticles: Article[] = [
  {
    id: 'article-1',
    title: 'テスト記事1',
    content: '本文1',
    category: 'マインドセット',
    date: '2023-01-01',
    originalDate: '2023-01-01',
    createdAt: '2025-10-19T12:00:00Z',
    tags: ['テスト']
  },
  {
    id: 'article-2',
    title: 'テスト記事2',
    content: '本文2',
    category: '習慣形成',
    date: '2023-01-02',
    originalDate: '2023-01-02',
    createdAt: '2025-10-19T12:00:00Z',
    tags: ['テスト']
  }
];

describe('Home', () => {
  const mockLoadArticles = jest.fn();
  const mockGetRandomArticle = jest.fn();
  const mockSetCurrentArticle = jest.fn();
  const mockToggleFavorite = jest.fn();
  const mockIsFavorite = jest.fn();

  beforeEach(() => {
    // モックのリセット
    jest.clearAllMocks();

    // useStoreのモック設定
    (useStore as unknown as jest.Mock).mockReturnValue({
      articles: [],
      currentArticle: null,
      loadArticles: mockLoadArticles,
      getRandomArticle: mockGetRandomArticle,
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ページタイトルが表示される', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('中心軸を整える')).toBeInTheDocument();
    });
  });

  it('初回読み込み時にarticles.jsonを取得する', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/articles.json');
      expect(mockLoadArticles).toHaveBeenCalledWith(mockArticles);
    });
  });

  it('ランダム記事を表示する', async () => {
    const testArticle = mockArticles[0];
    mockGetRandomArticle.mockReturnValue(testArticle);

    (useStore as unknown as jest.Mock).mockReturnValue({
      articles: mockArticles,
      currentArticle: testArticle,
      loadArticles: mockLoadArticles,
      getRandomArticle: mockGetRandomArticle,
      setCurrentArticle: mockSetCurrentArticle,
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('テスト記事1')).toBeInTheDocument();
    });
  });

  it('「次の記事」ボタンが表示される', async () => {
    const testArticle = mockArticles[0];
    mockGetRandomArticle.mockReturnValue(testArticle);

    (useStore as unknown as jest.Mock).mockReturnValue({
      articles: mockArticles,
      currentArticle: testArticle,
      loadArticles: mockLoadArticles,
      getRandomArticle: mockGetRandomArticle,
      setCurrentArticle: mockSetCurrentArticle,
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('次の記事')).toBeInTheDocument();
    });
  });

  it('「次の記事」ボタンクリックで新しい記事を表示', async () => {
    const article1 = mockArticles[0];
    const article2 = mockArticles[1];

    mockGetRandomArticle
      .mockReturnValueOnce(article1)
      .mockReturnValueOnce(article2);

    (useStore as unknown as jest.Mock).mockReturnValue({
      articles: mockArticles,
      currentArticle: article1,
      loadArticles: mockLoadArticles,
      getRandomArticle: mockGetRandomArticle,
      setCurrentArticle: mockSetCurrentArticle,
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite
    });

    render(<Home />);

    await waitFor(() => {
      const nextButton = screen.getByText('次の記事');
      fireEvent.click(nextButton);
      expect(mockSetCurrentArticle).toHaveBeenCalledWith(article2);
    });
  });

});
