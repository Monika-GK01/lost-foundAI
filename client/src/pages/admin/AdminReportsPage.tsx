import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Printer, Table2 } from 'lucide-react';
import { adminApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { value: 'recovered', label: 'Recovered Items' },
  { value: 'lost', label: 'Lost Items' },
  { value: 'found', label: 'Found Items' },
  { value: 'claims', label: 'Claims' },
] as const;

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
}

function downloadBlob(content: string | Blob, filename: string, mime: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const [type, setType] = useState<string>('recovered');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report', type, from, to],
    queryFn: () => adminApi.getReport({ type, from: from || undefined, to: to || undefined }),
  });

  const report = data?.data?.data;
  const headers = report?.headers ?? [];
  const rows = report?.rows ?? [];

  const filenameBase = `${type}-report-${new Date().toISOString().slice(0, 10)}`;

  const handleCsv = () => {
    if (rows.length === 0) {
      toast.error('No data to export');
      return;
    }
    downloadBlob(toCsv(headers, rows), `${filenameBase}.csv`, 'text/csv;charset=utf-8');
    toast.success('CSV downloaded');
  };

  const handlePdf = () => {
    if (rows.length === 0) {
      toast.error('No data to export');
      return;
    }
    const title = REPORT_TYPES.find((t) => t.value === type)?.label ?? 'Report';
    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Please allow pop-ups to export PDF');
      return;
    }
    const tableRows = rows
      .map((r) => `<tr>${r.map((c) => `<td>${String(c ?? '').replace(/</g, '&lt;')}</td>`).join('')}</tr>`)
      .join('');
    win.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            p { color: #666; font-size: 12px; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>${title} Report</h1>
          <p>Generated ${new Date().toLocaleString()} · ${rows.length} records${from || to ? ` · ${from || '…'} to ${to || '…'}` : ''}</p>
          <table>
            <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <script>window.onload = function () { window.print(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports Export</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Generate and export recovered, lost, found, and claims reports.
        </p>
      </div>

      {/* Controls */}
      <div className="card space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Report Type</label>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  type === t.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-[var(--color-text-secondary)] hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field" />
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={handleCsv} disabled={isFetching || rows.length === 0} className="btn-secondary disabled:opacity-50">
              <Download size={15} /> CSV
            </button>
            <button onClick={handlePdf} disabled={isFetching || rows.length === 0} className="btn-secondary disabled:opacity-50">
              <Printer size={15} /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="card p-0">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <Table2 size={16} /> Preview
          </h3>
          <span className="text-sm text-[var(--color-text-secondary)]">{report?.count ?? 0} records</span>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={<FileText size={40} />} title="No records" description="No data matches the selected filters." />
          </div>
        ) : (
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 bg-[var(--color-surface)] text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="whitespace-nowrap border-b border-[var(--color-border)] px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {rows.slice(0, 200).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    {row.map((cell, j) => (
                      <td key={j} className="whitespace-nowrap px-4 py-2.5 text-[var(--color-text-secondary)]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 200 && (
              <p className="border-t border-[var(--color-border)] px-4 py-2 text-center text-xs text-[var(--color-text-secondary)]">
                Showing first 200 of {rows.length} records. Export to view all.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
