/**
 * Zustand状態管理のテスト
 */

import { renderHook, act } from '@testing-library/react';
import { useStore } from './useStore';
import { Article } from '@/types';

// テスト用の記事データ
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
  },
  {
    id: 'article-3',
    title: 'テスト記事3',
    content: '本文3',
    category: 'マインドセット',
    date: '2023-01-03',
    originalDate: '2023-01-03',
    createdAt: '2025-10-19T12:00:00Z',
    tags: ['テスト']
  }
];

// LocalStorageモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('useStore', () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageとストアをリセット
    localStorage.clear();
    useStore.getState().reset();
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定されている', () => {
      const { result } = renderHook(() => useStore());

      expect(result.current.articles).toEqual([]);
      expect(result.current.readHistory).toEqual([]);
      expect(result.current.currentArticle).toBeNull();
      expect(result.current.categoryFilter).toBeNull();
    });
  });

  describe('loadArticles', () => {
    it('記事データを読み込める', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.loadArticles(mockArticles);
      });

      expect(result.current.articles).toEqual(mockArticles);
      expect(result.current.articles).toHaveLength(3);
    });
  });

  describe('getRandomArticle', () => {
    it('記事をランダムに取得できる', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.loadArticles(mockArticles);
      });

      const article = result.current.getRandomArticle();

      expect(article).not.toBeNull();
      expect(['article-1', 'article-2', 'article-3']).toContain(article?.id);
    });

    it('記事がない場合nullを返す', () => {
      const { result } = renderHook(() => useStore());

      const article = result.current.getRandomArticle();

      expect(article).toBeNull();
    });
  });

  describe('setCurrentArticle', () => {
    it('現在の記事を設定できる', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.loadArticles(mockArticles);
        result.current.setCurrentArticle(mockArticles[0]);
      });

      expect(result.current.currentArticle).toEqual(mockArticles[0]);
    });
  });

  describe('setCategoryFilter', () => {
    it('カテゴリーフィルターを設定できる', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCategoryFilter('マインドセット');
      });

      expect(result.current.categoryFilter).toBe('マインドセット');
    });

    it('nullでフィルターをクリアできる', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCategoryFilter('マインドセット');
        result.current.setCategoryFilter(null);
      });

      expect(result.current.categoryFilter).toBeNull();
    });
  });

  describe('getFilteredArticles', () => {
    it('フィルター未設定時は全記事を返す', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.loadArticles(mockArticles);
      });

      const articles = result.current.getFilteredArticles();

      expect(articles).toHaveLength(3);
    });

    it('カテゴリーフィルター設定時はフィルタリングされる', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.loadArticles(mockArticles);
        result.current.setCategoryFilter('マインドセット');
      });

      const articles = result.current.getFilteredArticles();

      expect(articles).toHaveLength(2);
      expect(articles.every(a => a.category === 'マインドセット')).toBe(true);
    });
  });
});
