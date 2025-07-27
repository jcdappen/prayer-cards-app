
import { CategoryInfo } from './types';

export const CATEGORIES: { [key: string]: Omit<CategoryInfo, 'cardCount'> } = {
  'PRAISE & GRATITUDE': { name: 'Praise & Gratitude', color: 'bg-praise', textColor: 'text-praise' },
  'ABIDING & PRESENCE': { name: 'Abiding & Presence', color: 'bg-abiding', textColor: 'text-abiding' },
  'CHARACTER & CONFESSION': { name: 'Character & Confession', color: 'bg-character', textColor: 'text-character' },
  'THE LORD’S PRAYER': { name: 'The Lord’s Prayer', color: 'bg-lords-prayer', textColor: 'text-lords-prayer' },
  'PETITIONS': { name: 'Petitions', color: 'bg-petitions', textColor: 'text-petitions' },
  'BIBLICAL PRAYERS': { name: 'Biblical Prayers', color: 'bg-biblical', textColor: 'text-biblical' },
  'MEDITATIONS': { name: 'Meditations', color: 'bg-meditations', textColor: 'text-meditations' },
  'ONE-SENTENCE PRAYERS': { name: 'One-Sentence Prayers', color: 'bg-one-sentence', textColor: 'text-one-sentence' },
  'MY CARDS': { name: 'My Cards', color: 'bg-gray-500', textColor: 'text-gray-500' },
};
