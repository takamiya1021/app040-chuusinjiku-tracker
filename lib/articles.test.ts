/**
 * 記事管理ロジックのテスト
 */

import { Article } from '@/types';
import {
  getRandomArticle,
  getArticlesByCategory,
  getArticleById,
  getAllCategories
} from './articles';

// テスト用の記事データ
const testArticles: Article[] = [
  {
    id: 'article-1',
    title: 'マインドセットの記事1',
    content: '本文1',
    category: 'マインドセット',
    date: '2023-01-01',
    originalDate: '2023-01-01',
    createdAt: '2025-10-19T12:00:00Z',
    tags: ['マインドセット', 'メンタル']
  },
  {
    id: 'article-2',
    title: '習慣形成の記事1',
    content: '本文2',
    category: '習慣形成',
    date: '2023-01-02',
    originalDate: '2023-01-02',
    createdAt: '2025-10-19T12:00:00Z',
    tags: ['習慣', 'メンタル']
  },
  {
    id: 'article-3',
    title: 'マインドセットの記事2',
    content: '本文3',
    category: 'マインドセット',
    date: '2023-01-03',
    originalDate: '2023-01-03',
    createdAt: '2025-10-19T12:00:00Z',
    tags: ['マインドセット', 'メンタル']
  },
  {
    id: 'article-4',
    title: '目標設定の記事1',
    content: '本文4',
    category: '目標設定',
    date: '2023-01-04',
    originalDate: '2023-01-04',
    createdAt: '2025-10-19T12:00:00Z',
    tags: ['目標', 'メンタル']
  }
];

describe('articles.ts', () => {
  describe('getRandomArticle', () => {
    it('記事配列からランダムに1つ取得できる', () => {
      const article = getRandomArticle(testArticles);

      expect(article).not.toBeNull();
      expect(testArticles).toContainEqual(article);
    });

    it('空配列の場合nullを返す', () => {
      const article = getRandomArticle([]);

      expect(article).toBeNull();
    });

    it('除外IDリストに含まれない記事を取得する', () => {
      const excludeIds = ['article-1', 'article-2'];
      const article = getRandomArticle(testArticles, excludeIds);

      expect(article).not.toBeNull();
      expect(['article-3', 'article-4']).toContain(article?.id);
    });

    it('全記事が除外された場合nullを返す', () => {
      const excludeIds = ['article-1', 'article-2', 'article-3', 'article-4'];
      const article = getRandomArticle(testArticles, excludeIds);

      expect(article).toBeNull();
    });
  });

  describe('getArticlesByCategory', () => {
    it('指定カテゴリーの記事を全て取得できる', () => {
      const articles = getArticlesByCategory(testArticles, 'マインドセット');

      expect(articles).toHaveLength(2);
      expect(articles.every(a => a.category === 'マインドセット')).toBe(true);
    });

    it('該当する記事がない場合空配列を返す', () => {
      const articles = getArticlesByCategory(testArticles, '存在しないカテゴリー');

      expect(articles).toEqual([]);
    });

    it('空配列を渡した場合空配列を返す', () => {
      const articles = getArticlesByCategory([], 'マインドセット');

      expect(articles).toEqual([]);
    });
  });

  describe('getArticleById', () => {
    it('IDで記事を取得できる', () => {
      const article = getArticleById(testArticles, 'article-2');

      expect(article).not.toBeNull();
      expect(article?.id).toBe('article-2');
      expect(article?.title).toBe('習慣形成の記事1');
    });

    it('存在しないIDの場合nullを返す', () => {
      const article = getArticleById(testArticles, 'non-existent-id');

      expect(article).toBeNull();
    });

    it('空配列の場合nullを返す', () => {
      const article = getArticleById([], 'article-1');

      expect(article).toBeNull();
    });
  });

  describe('getAllCategories', () => {
    it('全カテゴリーを重複なく取得できる', () => {
      const categories = getAllCategories(testArticles);

      expect(categories).toHaveLength(3);
      expect(categories).toContain('マインドセット');
      expect(categories).toContain('習慣形成');
      expect(categories).toContain('目標設定');
    });

    it('カテゴリーがソートされている', () => {
      const categories = getAllCategories(testArticles);

      const sorted = [...categories].sort();
      expect(categories).toEqual(sorted);
    });

    it('空配列の場合空配列を返す', () => {
      const categories = getAllCategories([]);

      expect(categories).toEqual([]);
    });

    it('同じカテゴリーが重複しない', () => {
      const categories = getAllCategories(testArticles);

      const uniqueCategories = Array.from(new Set(categories));
      expect(categories).toEqual(uniqueCategories);
    });
  });
});
