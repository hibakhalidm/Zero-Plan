'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {X} from 'lucide-react';
export default function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();const onEscape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();}};dialog?.addEventListener('keydown',onEscape);return()=>{dialog?.removeEventListener('keydown',onEscape);dialog?.close();};},[onClose]);
 return <dialog ref={ref} className="modal" aria-label={title} onCancel={onClose}><div className="modal-top"><span className="eyebrow">ZERO PLAN / YOUR SPACE</span><button aria-label="Close dialog" className="icon-button" onClick={onClose}><X/></button></div><h2>{title}</h2>{children}</dialog>;
}
