export const UI_VERSION = '1.0.0';

export * from './Card3DMesh';
export * from './Card3DCanvas';
export * from './GoldCard3DCanvas';

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function formatCardPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(price);
}
