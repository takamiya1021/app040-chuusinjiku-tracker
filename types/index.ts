/**
 * アプリケーション全体の型定義
 */

/**
 * 記事データの型
 */
export interface Article {
  /** 記事の一意識別子（UUID v4） */
  id: string;

  /** 記事タイトル（30文字以内） */
  title: string;

  /** 記事本文
   * - プライベート版：元メール本文そのまま
   * - パブリック版：要約版（1000〜3000文字）
   */
  content: string;

  /** カテゴリー（例：自己受容、目標設定、習慣形成など） */
  category: string;

  /** 記事の日付（YYYY-MM-DD形式） */
  date: string;

  /** 元メールの日付（YYYY-MM-DD形式） */
  originalDate: string;

  /** 作成日時（ISO 8601形式） */
  createdAt: string;

  /** タグリスト */
  tags: string[];

  /** 通し番号（日付昇順で自動採番、表示時に動的付与） */
  number?: number;

  /** 非表示フラグ（true: どこにも表示しない） */
  hidden?: boolean;
}

/**
 * 読了履歴の型
 */
export interface ReadHistory {
  /** 読了した記事のID */
  articleId: string;

  /** 読了日時（ISO 8601形式） */
  readAt: string;

  /** 読了済みフラグ */
  isRead: boolean;
}

/**
 * お気に入りの型
 */
export interface Favorite {
  /** お気に入り登録した記事のID */
  articleId: string;

  /** お気に入り登録日時（ISO 8601形式） */
  favoritedAt: string;
}

/**
 * アプリケーション状態の型
 */
export interface AppState {
  /** 全記事データ */
  articles: Article[];

  /** 読了履歴 */
  readHistory: ReadHistory[];

  /** お気に入りリスト */
  favorites: Favorite[];

  /** 現在表示中の記事（null = 未選択） */
  currentArticle: Article | null;

  /** カテゴリーフィルター（null = 全て表示） */
  categoryFilter: string | null;
}
