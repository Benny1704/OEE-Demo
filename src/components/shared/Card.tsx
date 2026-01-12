import React, { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick} 
    className={`bg-[var(--color-surface)] backdrop-blur-xl border border-[var(--color-border)] rounded-3xl shadow-lg shadow-black/5 overflow-hidden transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);