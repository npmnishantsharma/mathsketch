"use client"

import { create } from 'zustand';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state: ToastStore) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    if (toast.duration !== Infinity) {
      setTimeout(() => {
        set((state: ToastStore) => ({
          toasts: state.toasts.filter((t: Toast) => t.id !== id),
        }));
      }, toast.duration || 3000);
    }

    return id;
  },
  removeToast: (id: string) =>
    set((state: ToastStore) => ({
      toasts: state.toasts.filter((t: Toast) => t.id !== id),
    })),
}));

export function toast(props: Omit<Toast, 'id'>) {
  const { addToast } = useToast.getState();
  return addToast(props);
} 