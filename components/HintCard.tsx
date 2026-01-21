
import React from 'react';

interface HintCardProps {
  text: string;
  index: number;
  isRevealed: boolean;
}

const HintCard: React.FC<HintCardProps> = ({ text, index, isRevealed }) => {
  return (
    <div 
      className={`relative p-4 mb-4 transition-all duration-500 transform ${
        isRevealed ? 'opacity-100 translate-x-0' : 'opacity-30 blur-sm -translate-x-4 pointer-events-none'
      } receipt-texture border-l-4 border-red-500 shadow-md rotate-1 hover:rotate-0`}
    >
      <div className="absolute top-2 right-2 text-red-200 font-impact text-2xl">
        #{index + 1}
      </div>
      <p className="font-comic text-gray-800 text-lg leading-tight">
        {isRevealed ? text : '??? ????? ??????'}
      </p>
    </div>
  );
};

export default HintCard;
