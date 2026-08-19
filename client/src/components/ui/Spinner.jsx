import { Loader2 } from 'lucide-react';

function Spinner({ size = 24, label = 'Loading' }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2 text-slate-500">
      <Loader2 size={size} className="animate-spin text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </span>
  );
}

export default Spinner;
