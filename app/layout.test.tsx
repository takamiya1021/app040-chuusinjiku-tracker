/**
 * Layoutのテスト
 */

import { render, screen } from '@testing-library/react';
import RootLayout from './layout';

describe('RootLayout', () => {
  it('htmlタグにlang属性がある', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // RootLayoutが返す<html lang="ja">を確認
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // containerの中にhtml要素が存在し、lang="ja"が設定されていることを確認
    const htmlElement = container.querySelector('html');
    expect(htmlElement).toBeInTheDocument();
    expect(htmlElement?.getAttribute('lang')).toBe('ja');
  });

  it('Navigationコンポーネントが表示される', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Navigationの3つのリンクが表示される
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('アーカイブ')).toBeInTheDocument();
    expect(screen.getByText('カテゴリー')).toBeInTheDocument();
  });

  it('childrenが表示される', () => {
    render(
      <RootLayout>
        <div data-testid="test-content">Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('metadataにタイトルが含まれる', async () => {
    // metadataはビルド時に設定されるため、直接テストできない
    // 代わりにlayout.tsxファイル内でexportされているmetadataオブジェクトを確認
    const layoutModule = await import('./layout');

    expect(layoutModule.metadata).toBeDefined();
    expect(layoutModule.metadata.title).toBe('中心軸を整える');
  });

  it('metadataにdescriptionが含まれる', async () => {
    const layoutModule = await import('./layout');

    expect(layoutModule.metadata.description).toBe(
      'メンタルを整える習慣化アプリ。日々の記事を読んで、心の中心軸を保ちましょう。'
    );
  });
});
