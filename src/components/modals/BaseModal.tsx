'use client';

export type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  children: React.ReactNode;
};

const widthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

export function BaseModal({ isOpen, onClose, children, maxWidth = '2xl' }: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className={`relative w-full ${widthMap[maxWidth]} rounded-3xl border border-black/10 bg-white p-6 shadow-2xl`}>
        <button
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 hover:bg-black/5"
          aria-label="Закрыть"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
