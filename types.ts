
export interface PrayerCardType {
  id: number | string;
  category: string;
  frontHeadline: string;
  frontText: string;
  backHeadline: string;
  backTask: string;
  backText: string;
}

export interface CategoryInfo {
  name: string;
  color: string;
  textColor: string;
  cardCount: number;
}

export type View = 'home' | 'category' | 'card' | 'create';
