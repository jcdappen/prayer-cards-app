
import React from 'react';
import { PrayerCardType } from '../types';
import { CATEGORIES } from '../constants';
import CardContent from './CardContent';

interface PrayerCardProps {
  card: PrayerCardType;
  isFlipped: boolean;
  onClick: () => void;
}

const PrayerCard: React.FC<PrayerCardProps> = ({ card, isFlipped, onClick }) => {
  const categoryInfo = CATEGORIES[card.category];
  const cardColor = categoryInfo ? categoryInfo.color : 'bg-gray-400';

  return (
    <div className="w-full aspect-[3/4.5] perspective-1000" onClick={onClick}>
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front of Card */}
        <div className="absolute w-full h-full backface-hidden overflow-hidden flex flex-col bg-white shadow-lg">
          <div className={`${cardColor} p-2 text-white text-center font-bold uppercase text-xs tracking-wider`}>
            {card.category}
          </div>
          <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-base flex flex-col justify-center">
            <CardContent text={card.front} />
          </div>
          <div className={`${cardColor} p-2 text-white text-center font-bold uppercase text-xs tracking-wider`}>
            {card.category} {card.id}
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute w-full h-full backface-hidden overflow-hidden flex flex-col bg-white shadow-lg rotate-y-180">
          <div className={`${cardColor} p-2 text-white text-center font-bold uppercase text-xs tracking-wider`}>
            {card.category}
          </div>
          <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-base flex flex-col justify-center">
            <CardContent text={card.back} />
          </div>
          <div className={`${cardColor} p-2 text-white text-center font-bold uppercase text-xs tracking-wider`}>
            {card.category} {card.id}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add custom utilities to global scope for JIT compiler
const GlobalStyles = () => (
    <style>{`
    .perspective-1000 { perspective: 1000px; }
    .transform-style-3d { transform-style: preserve-3d; }
    .rotate-y-180 { transform: rotateY(180deg); }
    .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    `}</style>
)

const PrayerCardWithStyles: React.FC<PrayerCardProps> = (props) => (
    <>
        <GlobalStyles/>
        <PrayerCard {...props} />
    </>
)


export default PrayerCardWithStyles;
