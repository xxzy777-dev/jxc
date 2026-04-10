import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScanLine } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, isOpen, onClose }: BarcodeScannerProps) {
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
        onClose();
      },
      (error) => {
        // Ignore errors, usually just means no barcode found yet
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [isOpen, onScan, onClose]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div id="reader" className="w-full overflow-hidden rounded-md border border-slate-200"></div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or enter manually</span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="flex space-x-2">
            <Input 
              placeholder="Enter barcode..." 
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              autoFocus
            />
            <Button type="submit">Submit</Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ScanButton({ onScan }: { onScan: (text: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
        <ScanLine className="h-4 w-4" />
      </Button>
      <BarcodeScanner isOpen={isOpen} onClose={() => setIsOpen(false)} onScan={onScan} />
    </>
  );
}
