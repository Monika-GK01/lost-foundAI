import { Download } from 'lucide-react';

interface QRReceiptProps {
  qrCode: string;
  recoveryId: string;
  status: string;
  recoveryDate?: string;
}

export function QRReceipt({ qrCode, recoveryId, status, recoveryDate }: QRReceiptProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `recovery-receipt-${recoveryId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card flex flex-col items-center gap-4 p-6 text-center">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
        Recovery Receipt
      </h3>
      <img
        src={qrCode}
        alt={`QR code for recovery receipt ${recoveryId}`}
        className="h-48 w-48 rounded-lg border border-gray-200 dark:border-gray-700"
      />
      <div className="space-y-1 text-xs text-[var(--color-text-secondary)]">
        <p><span className="font-medium">Recovery ID:</span> {recoveryId}</p>
        <p><span className="font-medium">Status:</span> {status}</p>
        {recoveryDate && <p><span className="font-medium">Date:</span> {new Date(recoveryDate).toLocaleDateString()}</p>}
      </div>
      <button
        onClick={handleDownload}
        className="btn-secondary inline-flex items-center gap-2 text-xs"
        aria-label="Download recovery receipt QR code"
      >
        <Download size={14} />
        Download QR
      </button>
    </div>
  );
}
