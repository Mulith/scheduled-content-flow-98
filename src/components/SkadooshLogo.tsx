
import React from 'react';

interface SkadooshLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SkadooshLogo: React.FC<SkadooshLogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {/* Kung Fu Panda inspired design with martial arts elements */}
      <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-600 to-yellow-500 rounded-lg shadow-lg relative overflow-hidden">
        {/* Yin-Yang inspired center circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gradient-to-tr from-black to-white rounded-full">
          <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-1/4 h-1/4 bg-black rounded-full"></div>
        </div>
        {/* Martial arts energy lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1 left-1 w-1 h-4 bg-yellow-300 rounded opacity-70 transform rotate-45"></div>
          <div className="absolute top-1 right-1 w-1 h-4 bg-yellow-300 rounded opacity-70 transform -rotate-45"></div>
          <div className="absolute bottom-1 left-1 w-4 h-1 bg-yellow-300 rounded opacity-70 transform rotate-45"></div>
          <div className="absolute bottom-1 right-1 w-4 h-1 bg-yellow-300 rounded opacity-70 transform -rotate-45"></div>
        </div>
      </div>
    </div>
  );
};
