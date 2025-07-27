
import React from 'react';
import { CategoryInfo } from '../types';

interface CategoryTileProps {
  categoryInfo: CategoryInfo;
  onClick: () => void;
}

const CategoryTile: React.FC<CategoryTileProps> = ({ categoryInfo, onClick }) => {
  return (
    <div
      className={`p-6 flex flex-col justify-between h-36 cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-xl ${categoryInfo.color}`}
      onClick={onClick}
    >
      <h3 className="text-white font-bold text-lg leading-tight">{categoryInfo.name}</h3>
      <p className="text-white text-sm opacity-90">{categoryInfo.cardCount} cards</p>
    </div>
  );
};

export default CategoryTile;
