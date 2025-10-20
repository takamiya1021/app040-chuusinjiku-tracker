/**
 * 型定義のテスト
 *
 * TypeScriptの型チェック自体はコンパイル時に行われるため、
 * ここでは型定義が正しく使えるかを検証する
 */

import { Article, ReadHistory, AppState } from '@/types';

describe('型定義テスト', () => {
  describe('Article型', () => {
    it('Article型のオブジェクトを正しく作成できる', () => {
      const article: Article = {
        id: 'test-id',
        title: 'テストタイトル',
        content: 'テスト本文',
        category: 'マインドセット',
        date: '2023-01-01',
        originalDate: '2023-01-01',
        createdAt: '2025-10-19T12:00:00Z',
        tags: ['テスト', 'メンタル']
      };

      expect(article.id).toBe('test-id');
      expect(article.title).toBe('テストタイトル');
      expect(article.content).toBe('テスト本文');
      expect(article.category).toBe('マインドセット');
      expect(article.date).toBe('2023-01-01');
      expect(article.originalDate).toBe('2023-01-01');
      expect(article.createdAt).toBe('2025-10-19T12:00:00Z');
      expect(article.tags).toEqual(['テスト', 'メンタル']);
    });
  });

  describe('ReadHistory型', () => {
    it('ReadHistory型のオブジェクトを正しく作成できる', () => {
      const history: ReadHistory = {
        articleId: 'test-article-id',
        readAt: '2025-10-19T12:00:00Z',
        isRead: true
      };

      expect(history.articleId).toBe('test-article-id');
      expect(history.readAt).toBe('2025-10-19T12:00:00Z');
      expect(history.isRead).toBe(true);
    });
  });

  describe('AppState型', () => {
    it('AppState型のオブジェクトを正しく作成できる', () => {
      const state: AppState = {
        articles: [],
        readHistory: [],
        currentArticle: null,
        categoryFilter: null
      };

      expect(state.articles).toEqual([]);
      expect(state.readHistory).toEqual([]);
      expect(state.currentArticle).toBeNull();
      expect(state.categoryFilter).toBeNull();
    });

    it('currentArticleにArticle型を設定できる', () => {
      const article: Article = {
        id: 'test-id',
        title: 'テストタイトル',
        content: 'テスト本文',
        category: 'マインドセット',
        date: '2023-01-01',
        originalDate: '2023-01-01',
        createdAt: '2025-10-19T12:00:00Z',
        tags: ['テスト']
      };

      const state: AppState = {
        articles: [article],
        readHistory: [],
        currentArticle: article,
        categoryFilter: 'マインドセット'
      };

      expect(state.currentArticle).toEqual(article);
      expect(state.categoryFilter).toBe('マインドセット');
    });
  });
});
