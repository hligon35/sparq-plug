import { useEffect, useState } from 'react';
import clsx from 'clsx';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
  timeout?: number;
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ messages, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 min-w-[240px]" aria-live="polite" aria-relevant="additions removals">
      {messages.map(m => <Toast key={m.id} {...m} onRemove={onRemove} />)}
    </div>
  );
}

function Toast({ id, type, text, timeout = 3500, onRemove }: ToastMessage & { onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), timeout);
    return () => clearTimeout(t);
  }, [id, timeout, onRemove]);
  return (
    <div role="status" className={clsx('px-4 py-3 rounded-xl shadow border text-sm flex items-start gap-2 bg-white animate-fade-in',
      type === 'success' && 'border-green-300 text-green-800',
      type === 'error' && 'border-red-300 text-red-700',
      type === 'info' && 'border-blue-300 text-blue-700'
    )}>
      <span className="font-medium capitalize">{type}</span>
      <span className="flex-1">{text}</span>
      <button onClick={()=>onRemove(id)} className="text-xs text-gray-500 hover:text-gray-800">✕</button>
    </div>
  );
}

export function useToasts() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  function push(msg: Omit<ToastMessage,'id'>) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    setMessages(list => [...list, { id, timeout: 3500, ...msg }]);
  }
  function remove(id: string) { setMessages(list => list.filter(m => m.id !== id)); }
  return { messages, push, remove };
}

export default ToastContainer;