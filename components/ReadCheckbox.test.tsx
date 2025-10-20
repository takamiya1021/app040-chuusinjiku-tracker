/**
 * ReadCheckboxコンポーネントのテスト
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ReadCheckbox from './ReadCheckbox';

describe('ReadCheckbox', () => {
  it('チェックボックスが正しくレンダリングされる', () => {
    render(<ReadCheckbox checked={false} onChange={() => {}} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('checked=trueの時、チェックマークが表示される', () => {
    render(<ReadCheckbox checked={true} onChange={() => {}} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('checked=falseの時、チェックマークが表示されない', () => {
    render(<ReadCheckbox checked={false} onChange={() => {}} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('クリック時にonChangeが呼ばれる', () => {
    const handleChange = jest.fn();
    render(<ReadCheckbox checked={false} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('ラベルテキストが表示される（デフォルト: 読了）', () => {
    render(<ReadCheckbox checked={false} onChange={() => {}} />);

    expect(screen.getByText('読了')).toBeInTheDocument();
  });

  it('カスタムラベルが表示される', () => {
    render(
      <ReadCheckbox checked={false} onChange={() => {}} label="完了" />
    );

    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('disabled=trueの時、クリックできない', () => {
    const handleChange = jest.fn();
    render(<ReadCheckbox checked={false} onChange={handleChange} disabled={true} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);

    fireEvent.click(checkbox);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
