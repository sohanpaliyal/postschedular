import { cn } from '../ui/cn';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      className={cn('app-modal')}
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const bounds = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < bounds.left ||
          e.clientX > bounds.right ||
          e.clientY < bounds.top ||
          e.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <div className={cn('modal-header flex items-center justify-between')}>
        <div>
          <h2 id={titleId}>{title}</h2>
        </div>
        <Button
          variant="icon"
          className={cn('icon-button grid place-items-center p-[5px] rounded-[7px]')}
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
