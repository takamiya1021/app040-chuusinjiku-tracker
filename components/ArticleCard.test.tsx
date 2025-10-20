/**
 * ArticleCardコンポーネントのテスト
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ArticleCard from './ArticleCard';
import { Article } from '@/types';

const mockArticle: Article = {
  id: 'test-article-1',
  title: 'テスト記事タイトル',
  content: 'これはテスト記事の本文です。'.repeat(50), // 長めの本文
  category: 'マインドセット',
  date: '2023-01-15',
  originalDate: '2023-01-15',
  createdAt: '2025-10-19T12:00:00Z',
  tags: ['テスト', 'メンタル']
};

describe('ArticleCard', () => {
  describe('full variant', () => {
    it('記事タイトルが表示される', () => {
      render(<ArticleCard article={mockArticle} variant="full" />);

      expect(screen.getByText('テスト記事タイトル')).toBeInTheDocument();
    });

    it('カテゴリーが表示される', () => {
      render(<ArticleCard article={mockArticle} variant="full" />);

      expect(screen.getByText('マインドセット')).toBeInTheDocument();
    });

    it('本文が全文表示される', () => {
      render(<ArticleCard article={mockArticle} variant="full" />);

      // 本文の一部が含まれているか確認
      expect(screen.getByText(/これはテスト記事の本文です/)).toBeInTheDocument();
    });

  });

  describe('compact variant', () => {
    it('記事タイトルが表示される', () => {
      render(<ArticleCard article={mockArticle} variant="compact" />);

      expect(screen.getByText('テスト記事タイトル')).toBeInTheDocument();
    });

    it('カテゴリーが表示される', () => {
      render(<ArticleCard article={mockArticle} variant="compact" />);

      expect(screen.getByText('マインドセット')).toBeInTheDocument();
    });

    it('本文は表示されない', () => {
      render(<ArticleCard article={mockArticle} variant="compact" />);

      // 本文の全文は表示されないはず
      const fullContent = mockArticle.content;
      expect(screen.queryByText(fullContent)).not.toBeInTheDocument();
    });

  });

  describe('クリック動作', () => {
    it('カードクリック時にonClickが呼ばれる', () => {
      const handleClick = jest.fn();
      render(
        <ArticleCard
          article={mockArticle}
          variant="compact"
          onClick={handleClick}
        />
      );

      const card = screen.getByTestId('article-card');
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith('test-article-1');
    });

    it('onClickが未定義の場合もクリックできる', () => {
      render(<ArticleCard article={mockArticle} variant="compact" />);

      const card = screen.getByTestId('article-card');
      expect(() => {
        fireEvent.click(card);
      }).not.toThrow();
    });
  });
});
