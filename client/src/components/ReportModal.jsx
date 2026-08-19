import { useState } from 'react';
import { Flag, X, ShieldAlert } from 'lucide-react';
import { reportService } from '../services/reportService';
import Alert from './ui/Alert';
import Spinner from './ui/Spinner';

const REASONS = [
  'Spam or misleading content',
  'Fake or counterfeit product',
  'Inappropriate product',
  'Wrong or inaccurate description',
  'Inappropriate review comment',
  'Harassment or abuse',
  'Other',
];

export function ReportButton({ targetType, target, label }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!reason) {
      setError('Please select a reason for your report.');
      return;
    }

    setSubmitting(true);
    try {
      await reportService.createReport({
        targetType,
        targetId: target.id,
        reason,
      });
      setOpen(false);
      setReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        aria-label={`Report ${targetType}`}
        data-testid="report-button"
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Flag size={14} /> {label || 'Report'}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 px-4"
          role="dialog"
          aria-modal="true"
          data-testid="report-modal"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600">
                  <ShieldAlert size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Report {targetType === 'product' ? 'product' : 'review'}
                  </h3>
                  <p className="text-sm text-slate-500">Our moderation team will review it.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {error && <div className="mt-4"><Alert type="error" message={error} /></div>}

            <form onSubmit={handleSubmit} className="mt-4">
              <label htmlFor="report-reason" className="label-field">Reason</label>
              <select
                id="report-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                data-testid="report-reason"
                className="input-field"
              >
                <option value="">Select a reason...</option>
                {REASONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="submit-report"
                  className="btn-primary flex-1"
                >
                  {submitting ? <Spinner label="Submitting..." /> : 'Submit report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportButton;