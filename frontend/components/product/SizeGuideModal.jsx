'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Ruler } from 'lucide-react';

export default function SizeGuideModal() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 text-sm text-sand hover:text-terracotta transition-colors underline underline-offset-4">
          <Ruler size={16} /> Size Guide
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-kashish/80 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ivory p-6 rounded-md shadow-2xl z-50 w-[90vw] max-w-lg data-[state=open]:animate-fade-up">
          <div className="flex justify-between items-center mb-6 border-b border-sand/20 pb-4">
            <Dialog.Title className="font-display text-2xl text-kashish">Size Guide</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-sand hover:text-terracotta"><X size={20} /></button>
            </Dialog.Close>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-kashish font-body">
              <thead className="bg-cream font-label">
                <tr>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Chest (in)</th>
                  <th className="px-4 py-2">Waist (in)</th>
                  <th className="px-4 py-2">Shoulder (in)</th>
                </tr>
              </thead>
              <tbody>
                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <tr key={size} className="border-b border-sand/10">
                    <td className="px-4 py-3 font-semibold">{size}</td>
                    <td className="px-4 py-3">{size === 'S' ? 38 : size === 'M' ? 40 : size === 'L' ? 42 : size === 'XL' ? 44 : 46}</td>
                    <td className="px-4 py-3">{size === 'S' ? 32 : size === 'M' ? 34 : size === 'L' ? 36 : size === 'XL' ? 38 : 40}</td>
                    <td className="px-4 py-3">{size === 'S' ? 16 : size === 'M' ? 17 : size === 'L' ? 18 : size === 'XL' ? 19 : 20}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-sand italic">* All measurements are garment measurements in inches.</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
