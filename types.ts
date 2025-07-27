
export interface PrayerCardType {
  id: number | string;
  category: string;
  front: string;
  back: string;
  created_at?: string;
  user_id?: string;
}

export interface CategoryInfo {
  name: string;
  color: string;
  textColor: string;
  cardCount: number;
}

export type View = 'home' | 'category' | 'card' | 'create' | 'edit';
