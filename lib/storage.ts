/**
 * LocalStorage操作ユーティリティ
 */

/**
 * データをLocalStorageに保存
 *
 * @param key - 保存キー
 * @param data - 保存するデータ（JSON.stringifyで文字列化される）
 */
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    // エラー時はコンソールに警告を出力して続行
    console.warn(`Failed to save to localStorage (key: ${key}):`, error);
  }
}

/**
 * LocalStorageからデータを読み込み
 *
 * @param key - 読み込むキー
 * @returns パースされたデータ、存在しない場合やエラー時はnull
 */
export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const serialized = localStorage.getItem(key);

    // データが存在しない、または空文字列の場合
    if (!serialized) {
      return null;
    }

    // JSONパース
    const data = JSON.parse(serialized) as T;
    return data;
  } catch (error) {
    // パースエラーまたはその他のエラー時はnullを返す
    console.warn(`Failed to load from localStorage (key: ${key}):`, error);
    return null;
  }
}
