/**
 * FavoriteButtonコンポーネントのテスト
 */

import { render, screen, fireEvent } from '@testing-library/react';
import FavoriteButton from './FavoriteButton';

describe('FavoriteButton', () => {
  it('お気に入り未登録時に空のハートアイコンが表示される', () => {
    render(<FavoriteButton isFavorite={false} onChange={() => {}} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain('♡'); // 空ハート
  });

  it('お気に入り登録時に塗りつぶしハートアイコンが表示される', () => {
    render(<FavoriteButton isFavorite={true} onChange={() => {}} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain('❤'); // 塗りつぶしハート
  });

  it('ボタンクリック時にonChangeが呼ばれる', () => {
    const handleChange = jest.fn();
    render(<FavoriteButton isFavorite={false} onChange={handleChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('disabled時はonChangeが呼ばれない', () => {
    const handleChange = jest.fn();
    render(<FavoriteButton isFavorite={false} onChange={handleChange} disabled={true} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('disabled時はボタンが無効化される', () => {
    render(<FavoriteButton isFavorite={false} onChange={() => {}} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
