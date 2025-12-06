import React from 'react';
import { Category } from '../types';

interface QuizButtonProps {
  category: Category;
  onClick: (category: Category) => void;
  disabled: boolean;
  colorClass: string;
  className?: string;
}

const QuizButton: React.FC<QuizButtonProps> = ({ category, onClick, disabled, colorClass, className = "" }) => {
  return (
    <button
      onClick={() => onClick(category)}
      disabled={disabled}
      className={`
        w-full rounded-xl text-lg md:text-xl font-bold shadow-sm transition-all duration-200
        flex items-center justify-center text-center leading-none break-words
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 hover:shadow-md'}
        ${colorClass}
        text-white border-b-4 border-opacity-20 border-black
        ${className}
      `}
    >
      {category}
    </button>
  );
};

export default QuizButton;