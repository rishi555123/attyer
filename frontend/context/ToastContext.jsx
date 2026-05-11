'use client';
import { createContext, useContext, useState } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showToast = (msg) => {
    setMessage(msg);
    setOpen(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastPrimitive.Root open={open} onOpenChange={setOpen} className="bg-kashish text-ivory p-4 rounded-md shadow-lg data-[state=open]:animate-slide-in">
          <ToastPrimitive.Title className="font-body text-sm font-semibold">{message}</ToastPrimitive.Title>
        </ToastPrimitive.Root>
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-2 w-96 max-w-[100vw] z-50 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
