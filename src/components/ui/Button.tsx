import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
}

const base = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700 focus-visible:ring-purple-500',
  secondary: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus-visible:ring-blue-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-blue-500'
};

const sizes: Record<Size,string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  className,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  disabled,
  ...rest
}, ref) {
  return (
    <button
      ref={ref}
      className={clsx(base, variants[variant], sizes[size], block && 'w-full', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="w-4 h-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});

export default Button;