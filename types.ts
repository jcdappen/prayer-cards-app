
export interface PrayerCardType {
  id: number;
  category: string;
  front: string;
  back: string;
}

export interface CategoryInfo {
  name: string;
  color: string;
  textColor: string;
  cardCount: number;
}

export type View = 'home' | 'category' | 'card' | 'create';
