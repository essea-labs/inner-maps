'use client';

interface CtaButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
}

export default function CtaButton({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  fullWidth = true,
  type = 'button',
}: CtaButtonProps) {
  const baseClass = fullWidth ? 'cta-button' : 'cta-button';
  const variantClass =
    variant === 'secondary'
      ? 'cta-button-secondary'
      : variant === 'ghost'
      ? 'cta-button-ghost'
      : '';

  return (
    <button
      type={type}
      className={[baseClass, variantClass].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled}
      style={fullWidth ? undefined : { width: 'auto', padding: '12px 28px' }}
    >
      {children}
    </button>
  );
}
