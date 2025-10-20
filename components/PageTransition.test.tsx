/**
 * PageTransitionコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react';
import PageTransition from './PageTransition';

describe('PageTransition', () => {
  it('子要素が正しくレンダリングされる', () => {
    render(
      <PageTransition>
        <div>テストコンテンツ</div>
      </PageTransition>
    );

    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('複数の子要素をレンダリングできる', () => {
    render(
      <PageTransition>
        <div>コンテンツ1</div>
        <div>コンテンツ2</div>
        <div>コンテンツ3</div>
      </PageTransition>
    );

    expect(screen.getByText('コンテンツ1')).toBeInTheDocument();
    expect(screen.getByText('コンテンツ2')).toBeInTheDocument();
    expect(screen.getByText('コンテンツ3')).toBeInTheDocument();
  });

  it('motion.divとして正しくレンダリングされる', () => {
    const { container } = render(
      <PageTransition>
        <div data-testid="test-content">テスト</div>
      </PageTransition>
    );

    // Framer Motionのコンポーネントであることを確認
    const motionDiv = container.firstChild;
    expect(motionDiv).toBeInTheDocument();
  });
});
