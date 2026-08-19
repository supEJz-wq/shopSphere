import { AlertCircle, CheckCircle2 } from 'lucide-react';

function Alert({ type = 'error', message }) {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div
      role="alert"
      data-testid={isError ? 'error-alert' : 'success-alert'}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
        isError
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      {isError ? (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}

export default Alert;
