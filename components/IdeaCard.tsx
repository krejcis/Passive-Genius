import React from 'react';
import { IncomeIdea, Difficulty } from '../types';
import { ArrowRight, DollarSign, Clock, Heart } from 'lucide-react';

interface IdeaCardProps {
  idea: IncomeIdea;
  isFavorite: boolean;
  onSelect: (idea: IncomeIdea) => void;
  onToggleFavorite: (e: React.MouseEvent, idea: IncomeIdea) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, isFavorite, onSelect, onToggleFavorite }) => {
  const difficultyColor = {
    [Difficulty.Easy]: 'bg-green-100 text-green-800',
    [Difficulty.Medium]: 'bg-yellow-100 text-yellow-800',
    [Difficulty.Hard]: 'bg-red-100 text-red-800',
  };

  return (
    <div 
      onClick={() => onSelect(idea)}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer active:scale-[0.98] relative group"
    >
      <div className="flex justify-between items-start mb-3 pr-8">
        <h3 className="text-lg font-bold text-gray-800 leading-tight">{idea.title}</h3>
      </div>
      
      <button 
        onClick={(e) => onToggleFavorite(e, idea)}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-50 transition-colors z-10"
      >
        <Heart 
          size={20} 
          className={`transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300 hover:text-gray-500'}`} 
        />
      </button>
      
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${difficultyColor[idea.difficulty]}`}>
          {idea.difficulty}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {idea.description}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <DollarSign className="w-4 h-4 mr-1.5 text-brand-500" />
          <span>{idea.estimatedMonthlyRevenue}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1.5 text-brand-500" />
          <span>{idea.timeToRevenue}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {idea.tags.slice(0, 3).map((tag, idx) => (
          <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>

      <button className="w-full mt-2 bg-brand-50 text-brand-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center group-hover:bg-brand-100 transition-colors">
        View Strategy
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default IdeaCard;