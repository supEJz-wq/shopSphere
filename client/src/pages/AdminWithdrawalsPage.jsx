import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, Search, CheckCircle2, XCircle, Clock3, Landmark, Smartphone, Wallet, Receipt, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { adminService } from '../services/adminService';
import { formatPrice } from '../utils/formatPrice';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const METHOD_CONFIG = {
  bank_transfer: { label: 'Bank transfer', icon: Landmark },
  gcash: { label: 'GCash', icon: Smartphone },
  paypal: { label: 'PayPal', icon: Wallet },
};

const STATUS_CONFIG = {
  processing: { label: 'Processing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Sent / Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-600 border-red-200' },
};

const FILTERS = [
  { key: 'processing', label: 'Processing' },
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Sent' },
  { key: 'rejected', label: 'Rejected' },
];

function AdminWithdrawalsPage() {
  const checked = useRequireAuth();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('processing');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const [approveTarget, setApproveTarget] = useState(null);
  const [payoutMethod, setPayoutMethod] = useState('gcash');
  const [adminNote, setAdminNote] = useState('');
  const [noteFor, setNoteFor] = useState(null);

  useEffect(() => {
    if (!checked) return;
    const checkAdmin = async () => {
      try {
        const freshUser = await refreshUser();
        if (freshUser.role !== 'admin') navigate('/', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    };
    checkAdmin();
  }, [checked, navigate, refreshUser]);

  useEffect(() => {
    if (!checked || user?.role !== 'admin') return;
    const fetchWithdrawals = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getWithdrawals({ status: filter === 'all' ? undefined : filter, search });
        setWithdrawals(data.withdrawals);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load withdrawals.');
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawals();
  }, [checked, filter, search, user?.role]);

  if (!checked) return null;

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Admins only</h1>
        <p className="mt-2 text-slate-500">You need an admin account to review withdrawals.</p>
      </div>
    );
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!approveTarget) return;
    setUpdatingId(approveTarget.id);
    setApiError('');
    try {
      await adminService.approveWithdrawal(approveTarget.id, {
        method: payoutMethod,
        adminNote: adminNote.trim() || undefined,
      });
      setApproveTarget(null);
      setAdminNote('');
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === approveTarget.id
            ? { ...w, status: 'completed', method: payoutMethod, adminNote: adminNote.trim() || null }
            : w
        )
      );
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not approve this withdrawal.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async () => {
    if (!noteFor) return;
    setUpdatingId(noteFor.id);
    setApiError('');
    try {
      await adminService.rejectWithdrawal(noteFor.id, {
        adminNote: adminNote.trim() || undefined,
      });
      setNoteFor(null);
      setAdminNote('');
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === noteFor.id ? { ...w, status: 'rejected', adminNote: adminNote.trim() || null } : w
        )
      );
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not reject this withdrawal.');
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = withdrawals.filter((w) => w.status === 'processing').length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-10">
      <div>
        <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight text-slate-900">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Banknote size={24} />
          </span>
          Withdrawals
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Approve seller withdrawal requests and send the payout to bank, GCash, or PayPal.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search receipt, seller, store..."
            data-testid="withdrawals-search"
            className="input-field w-full pl-10"
          />
        </form>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              data-testid={`withdrawals-tab-${item.key}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === item.key
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
              {item.key === 'processing' && pendingCount > 0 && (
                <span className="ml-1 rounded-full bg-white/30 px-1.5 text-[10px]">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {apiError && <div className="mt-6"><Alert type="error" message={apiError} /></div>}
      {error && <div className="mt-6"><Alert type="error" message={error} /></div>}

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Clock3 size={28} />
          </span>
          <p data-testid="no-withdrawals" className="mt-4 font-semibold text-slate-900">
            No withdrawals
          </p>
          <p className="mt-1 text-sm text-slate-500">Nothing to review right now.</p>
        </div>
      ) : (
        <ul data-testid="withdrawal-list" className="mt-8 space-y-4">
          {withdrawals.map((w) => {
            const status = STATUS_CONFIG[w.status] || STATUS_CONFIG.processing;
            const MethodIcon = METHOD_CONFIG[w.method]?.icon || Wallet;
            return (
              <li
                key={w.id}
                data-testid="withdrawal-card"
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{formatPrice(w.amount)}</h2>
                      <span data-testid="withdrawal-status" className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Receipt <span className="font-mono font-semibold">{w.receiptNumber}</span> · requested{' '}
                      {new Date(w.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Fee {formatPrice(w.fee)} · net {formatPrice(w.net)}
                      {w.processedAt && <> · settled {new Date(w.processedAt).toLocaleString()}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-600`}>
                      <MethodIcon size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {w.seller?.storeName || w.seller?.name || 'Unknown seller'}
                      </p>
                      <p className="text-xs text-slate-500">{w.seller?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
                  <span className="font-semibold text-slate-600">Requested method:</span>
                  <span className="font-medium text-slate-800">{METHOD_CONFIG[w.method]?.label || w.method}</span>
                  {w.adminNote && (
                    <span className="ml-auto text-xs text-slate-500">Admin note: {w.adminNote}</span>
                  )}
                </div>

                {w.status === 'processing' && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setApproveTarget(w);
                        setPayoutMethod(w.method);
                        setAdminNote('');
                        setApiError('');
                      }}
                      disabled={updatingId === w.id}
                      data-testid={`approve-${w.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Send size={16} /> Approve & send
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNoteFor(w);
                        setAdminNote('');
                        setApiError('');
                      }}
                      disabled={updatingId === w.id}
                      data-testid={`reject-${w.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={handleApprove} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Approve withdrawal</h2>
              <button
                type="button"
                onClick={() => setApproveTarget(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Send <span className="font-bold text-emerald-600">{formatPrice(approveTarget.net)}</span> to{' '}
              {approveTarget.seller?.storeName || approveTarget.seller?.name} (
              {approveTarget.seller?.email}).
            </p>
            {apiError && <div className="mt-3"><Alert type="error" message={apiError} /></div>}

            <p className="mt-4 text-sm font-semibold text-slate-700">Send via</p>
            <div className="mt-1.5 grid gap-2">
              {Object.entries(METHOD_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                      payoutMethod === key
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payout-method"
                      value={key}
                      checked={payoutMethod === key}
                      onChange={() => setPayoutMethod(key)}
                      data-testid={`payout-method-${key}`}
                      className="accent-emerald-600"
                    />
                    <Icon size={18} className="text-slate-600" />
                    <span className="text-sm font-semibold text-slate-900">{cfg.label}</span>
                  </label>
                );
              })}
            </div>

            <label htmlFor="approve-note" className="mt-4 block text-sm font-semibold text-slate-700">
              Admin note (optional)
            </label>
            <textarea
              id="approve-note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={2}
              placeholder="e.g. Sent via GCash 09171234567"
              data-testid="approve-note"
              className="input-field mt-1.5 resize-none"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setApproveTarget(null)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={updatingId === approveTarget.id} data-testid="confirm-approve" className="btn-primary">
                {updatingId === approveTarget.id ? <Spinner label="Sending..." /> : 'Approve & send'}
              </button>
            </div>
          </form>
        </div>
      )}

      {noteFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <XCircle size={20} className="text-red-500" /> Reject withdrawal
              </h2>
              <button
                type="button"
                onClick={() => setNoteFor(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {formatPrice(noteFor.amount)} to {noteFor.seller?.storeName || noteFor.seller?.name} will be returned to their wallet.
            </p>
            {apiError && <div className="mt-3"><Alert type="error" message={apiError} /></div>}
            <label htmlFor="reject-note" className="mt-4 block text-sm font-semibold text-slate-700">
              Reason (optional)
            </label>
            <textarea
              id="reject-note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="e.g. Invalid account details provided"
              data-testid="reject-note"
              className="input-field mt-1.5 resize-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setNoteFor(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={updatingId === noteFor.id}
                data-testid="confirm-reject"
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {updatingId === noteFor.id ? <Spinner label="Rejecting..." /> : 'Reject withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminWithdrawalsPage;