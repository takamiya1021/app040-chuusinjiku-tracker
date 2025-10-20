/**
 * Zustand状態管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Article, ReadHistory, Favorite, AppState } from '@/types';
import { getRandomArticle, getArticlesByCategory } from '@/lib/articles';

interface StoreActions {
  /** 記事データを読み込み */
  loadArticles: (articles: Article[]) => void;

  /** お気に入りに追加/削除（トグル） */
  toggleFavorite: (articleId: string) => void;

  /** 記事がお気に入りかチェック */
  isFavorite: (articleId: string) => boolean;

  /** ランダムに記事を取得 */
  getRandomArticle: () => Article | null;

  /** 現在の記事を設定 */
  setCurrentArticle: (article: Article | null) => void;

  /** カテゴリーフィルターを設定 */
  setCategoryFilter: (category: string | null) => void;

  /** フィルター済み記事一覧を取得 */
  getFilteredArticles: () => Article[];

  /** ストアをリセット（テスト用） */
  reset: () => void;
}

type Store = AppState & StoreActions;

const initialState: AppState = {
  articles: [],
  readHistory: [],
  favorites: [],
  currentArticle: null,
  categoryFilter: null
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      loadArticles: (articles) => {
        // 非表示フラグのある記事を除外
        const visibleArticles = articles.filter(article => !article.hidden);
        set({ articles: visibleArticles });
      },

      toggleFavorite: (articleId) => {
        const { favorites } = get();

        // 既にお気に入りかチェック
        const isFavorited = favorites.some(f => f.articleId === articleId);

        if (isFavorited) {
          // お気に入りから削除
          set({
            favorites: favorites.filter(f => f.articleId !== articleId)
          });
        } else {
          // お気に入りに追加
          const newFavorite: Favorite = {
            articleId,
            favoritedAt: new Date().toISOString()
          };

          set({
            favorites: [...favorites, newFavorite]
          });
        }
      },

      isFavorite: (articleId) => {
        const { favorites } = get();
        return favorites.some(f => f.articleId === articleId);
      },

      getRandomArticle: () => {
        const { articles } = get();

        // 非表示記事を除外してランダムに取得
        const visibleArticles = articles.filter(article => !article.hidden);
        return getRandomArticle(visibleArticles);
      },

      setCurrentArticle: (article) => {
        set({ currentArticle: article });
      },

      setCategoryFilter: (category) => {
        set({ categoryFilter: category });
      },

      getFilteredArticles: () => {
        const { articles, categoryFilter } = get();

        if (!categoryFilter) {
          return articles;
        }

        return getArticlesByCategory(articles, categoryFilter);
      },

      reset: () => {
        set(initialState);
      }
    }),
    {
      name: 'chuusinjiku-storage', // LocalStorageのキー名
      partialize: (state) => ({
        // 永続化する項目を選択（currentArticle は除外）
        favorites: state.favorites,
        categoryFilter: state.categoryFilter
      })
    }
  )
);
