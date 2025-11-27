import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean; // 👈 añadida
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  fullWidth = false,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out';
  
  const variantClasses = {
    primary:
      'bg-green-600 hover:bg-green-700 text-white border border-transparent focus:ring-green-500 shadow-sm hover:shadow-md',
    secondary:
      'bg-gray-600 hover:bg-gray-700 text-white border border-transparent focus:ring-gray-500 shadow-sm hover:shadow-md',
    danger:
      'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-red-500 shadow-sm hover:shadow-md',
    outline:
      'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-green-500 shadow-sm hover:shadow-md',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const isDisabled = disabled || loading;
  const disabledClasses = isDisabled
    ? 'opacity-50 cursor-not-allowed hover:bg-current hover:shadow-current'
    : '';
  
  const widthClass = fullWidth ? 'w-full' : '';

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${widthClass}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <button
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </button>
  );
};

export default Button;
