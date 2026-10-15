import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { const ref = useRef<HTMLDialogElement>(null); useEffect(() => { const el = ref.current; el?.showModal(); return () => el?.close(); }, []); return <dialog ref={ref} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-header"><div><span className="eyebrow">FLINTZY WORKSPACE</span><h2>{title}</h2></div><Button variant="icon" className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20}/></Button></div>{children}</dialog>; }
