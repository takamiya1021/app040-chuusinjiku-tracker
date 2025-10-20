/**
 * Navigationコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react';
import Navigation from './Navigation';
import { usePathname } from 'next/navigation';

// Next.js の usePathname をモック
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Navigation', () => {
  beforeEach(() => {
    // usePathname のモックをリセット
    mockUsePathname.mockReturnValue('/');
  });

  it('ホームリンクが表示される', () => {
    render(<Navigation />);

    const homeLink = screen.getByText('ホーム');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('アーカイブリンクが表示される', () => {
    render(<Navigation />);

    const archiveLink = screen.getByText('アーカイブ');
    expect(archiveLink).toBeInTheDocument();
    expect(archiveLink.closest('a')).toHaveAttribute('href', '/archive');
  });

  it('カテゴリーリンクが表示される', () => {
    render(<Navigation />);

    const categoriesLink = screen.getByText('カテゴリー');
    expect(categoriesLink).toBeInTheDocument();
    expect(categoriesLink.closest('a')).toHaveAttribute('href', '/categories');
  });

  it('現在のページのリンクがアクティブスタイルになる（ホーム）', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Navigation />);

    const homeLink = screen.getByText('ホーム').closest('a');
    expect(homeLink).toHaveClass('bg-blue-600');
  });

  it('現在のページのリンクがアクティブスタイルになる（アーカイブ）', () => {
    mockUsePathname.mockReturnValue('/archive');

    render(<Navigation />);

    const archiveLink = screen.getByText('アーカイブ').closest('a');
    expect(archiveLink).toHaveClass('bg-blue-600');
  });

  it('現在のページのリンクがアクティブスタイルになる（カテゴリー）', () => {
    mockUsePathname.mockReturnValue('/categories');

    render(<Navigation />);

    const categoriesLink = screen.getByText('カテゴリー').closest('a');
    expect(categoriesLink).toHaveClass('bg-blue-600');
  });

  it('非アクティブなリンクは通常スタイルになる', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Navigation />);

    const archiveLink = screen.getByText('アーカイブ').closest('a');
    expect(archiveLink).toHaveClass('bg-gray-100');
    expect(archiveLink).not.toHaveClass('bg-blue-600');
  });
});
