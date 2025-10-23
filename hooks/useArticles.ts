/**
 * 記事データ読み込みフック
 * 共通の記事データ読み込みロジック
 */

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function useArticles() {
  const { articles, loadArticles } = useStore();

  // 初回読み込み時に記事データを取得
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/articles-app.json');
        if (response.ok) {
          const data = await response.json();
          loadArticles(data);
        }
      } catch (error) {
        console.error('Failed to load articles:', error);
      }
    };

    if (articles.length === 0) {
      fetchArticles();
    }
  }, [articles.length, loadArticles]);
}
