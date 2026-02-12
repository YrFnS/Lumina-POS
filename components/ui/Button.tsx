import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-none uppercase tracking-wide";
  
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-black dark:bg-lumina-500 dark:text-gray-900 dark:hover:bg-lumina-400 border-2 border-transparent",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700 border-2 border-red-600",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
    outline: "bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white dark:border-gray-100 dark:text-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-12 px-6 text-sm",
    lg: "h-16 px-8 text-lg",
    icon: "h-12 w-12 p-2",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};