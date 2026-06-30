'use client';

import { useState } from 'react';
import { Database, Loader2 } from 'lucide-react';

export function BackupDatabaseButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/backup', { credentials: 'include' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Backup failed');
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const match = cd.match(/filename="([^"]+)"/);
      const filename = match?.[1] || 'fizam-backup.db';

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Backup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        onClick={run}
        disabled={busy}
        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-60"
      >
        <div className="flex items-center gap-3">
          {busy ? (
            <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
          ) : (
            <Database className="w-5 h-5 text-gray-600" />
          )}
          <span className="text-[#1a1f71]">{busy ? 'Preparing backup…' : 'Backup Database'}</span>
        </div>
        <span className="text-sm text-gray-500">↓</span>
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
