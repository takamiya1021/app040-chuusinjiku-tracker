/**
 * ストレージユーティリティのテスト
 */

import { saveToLocalStorage, loadFromLocalStorage } from './storage';

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// グローバルなlocalStorageをモックに差し替え
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('storage.ts', () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageをクリア
    localStorage.clear();
  });

  describe('saveToLocalStorage', () => {
    it('データをLocalStorageに保存できる', () => {
      const testData = { name: 'test', value: 123 };
      saveToLocalStorage('testKey', testData);

      const saved = localStorage.getItem('testKey');
      expect(saved).toBe(JSON.stringify(testData));
    });

    it('配列データをLocalStorageに保存できる', () => {
      const testData = [1, 2, 3, 4, 5];
      saveToLocalStorage('arrayKey', testData);

      const saved = localStorage.getItem('arrayKey');
      expect(saved).toBe(JSON.stringify(testData));
    });

    it('nullを保存できる', () => {
      saveToLocalStorage('nullKey', null);

      expect(localStorage.getItem('nullKey')).toBe('null');
    });
  });

  describe('loadFromLocalStorage', () => {
    it('LocalStorageからデータを読み込める', () => {
      const testData = { name: 'test', value: 123 };
      localStorage.setItem('testKey', JSON.stringify(testData));

      const loaded = loadFromLocalStorage('testKey');
      expect(loaded).toEqual(testData);
    });

    it('存在しないキーの場合nullを返す', () => {
      const loaded = loadFromLocalStorage('nonExistentKey');
      expect(loaded).toBeNull();
    });

    it('配列データを読み込める', () => {
      const testData = [1, 2, 3, 4, 5];
      localStorage.setItem('arrayKey', JSON.stringify(testData));

      const loaded = loadFromLocalStorage('arrayKey');
      expect(loaded).toEqual(testData);
    });

    it('不正なJSONの場合nullを返す', () => {
      localStorage.setItem('invalidKey', 'invalid json string');

      const loaded = loadFromLocalStorage('invalidKey');
      expect(loaded).toBeNull();
    });

    it('空文字列の場合nullを返す', () => {
      localStorage.setItem('emptyKey', '');

      const loaded = loadFromLocalStorage('emptyKey');
      expect(loaded).toBeNull();
    });
  });

  describe('エラーハンドリング', () => {
    it('保存時にエラーが発生してもクラッシュしない', () => {
      // localStorageのsetItemでエラーを発生させる
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };

      expect(() => {
        saveToLocalStorage('errorKey', { data: 'test' });
      }).not.toThrow();

      // 元に戻す
      localStorage.setItem = originalSetItem;
    });

    it('読み込み時にエラーが発生してもクラッシュしない', () => {
      // localStorageのgetItemでエラーを発生させる
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error('Storage access denied');
      };

      expect(() => {
        loadFromLocalStorage('errorKey');
      }).not.toThrow();

      // 元に戻す
      localStorage.getItem = originalGetItem;
    });
  });
});
