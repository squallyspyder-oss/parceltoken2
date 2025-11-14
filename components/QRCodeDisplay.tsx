import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from './ui/button';
import { Download, Printer } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  showActions?: boolean;
  label?: string;
}

export function QRCodeDisplay({ value, size = 256, showActions = true, label }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [value, size]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = url;
      link.click();
    }
  };

  const handlePrint = () => {
    if (canvasRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const url = canvasRef.current.toDataURL('image/png');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Imprimir QR Code</title>
              <style>
                body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  font-family: Arial, sans-serif;
                }
                img {
                  max-width: 400px;
                  height: auto;
                }
                h2 {
                  margin-bottom: 20px;
                }
                @media print {
                  body {
                    padding: 20px;
                  }
                }
              </style>
            </head>
            <body>
              ${label ? `<h2>${label}</h2>` : ''}
              <img src="${url}" alt="QR Code" />
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="border-2 border-slate-200 dark:border-slate-700 rounded-lg" />
      {showActions && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>
      )}
    </div>
  );
}
