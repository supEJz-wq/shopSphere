import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, RefreshCw, Truck, Ban, PackageX, Package, ArrowUpRight, ArrowDownRight, Clock3, Banknote, Gift, Receipt, X, CheckCircle2, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { sellerService } from '../services/sellerService';
import { formatPrice } from '../utils/formatPrice';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const WITHDRAWAL_FEE_RATE = 0.02;

const METHOD_CONFIG = {
  bank_transfer: { label: 'Bank transfer', desc: '2-4 business days' },
  gcash: { label: 'GCash', desc: 'Instant' },
  paypal: { label: 'PayPal', desc: '1-2 business days' },
};

const WITHDRAWAL_METHODS = Object.keys(METHOD_CONFIG);

const WITHDRAWAL_BADGE = {
  processing: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
  cancelled: 'bg-red-100 text-red-600',
};

const statusBadge = {
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
};

const statusLabel = {
  processing: 'To ship',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'processing', label: 'To ship' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'cancelled', label: 'Cancelled' },
];

function SellerWalletPage() {
  const checked = useRequireAuth();
  const { refreshUser } = useAuth();

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer');
  const [withdrawApiError, setWithdrawApiError] = useState('');
  const [withdrawBusy, setWithdrawBusy] = useState(false);

  const [receipt, setReceipt] = useState(null);

  const fetchWallet = async () => {
    setError(null);
    try {
      const data = await sellerService.getWallet();
      setWallet(data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Your shop has been banned. Contact support for assistance.');
        return;
      }
      setError(err.response?.data?.message || 'Could not load your wallet.');
    }
  };

  useEffect(() => {
    if (!checked) return;

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        await refreshUser();
        await fetchWallet();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [checked, refreshUser]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!checked) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-10">
        <Skeleton className="h-9 w-56 rounded-lg" />
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-10 h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert type="error" message={error} />
      </div>
    );
  }

  const totals = wallet?.totals || {
    totalRevenue: 0,
    pending: 0,
    shipped: 0,
    cancelled: 0,
    unitsSold: 0,
    withdrawn: 0,
    balance: 0,
  };
  const history = wallet?.history || [];
  const withdrawals = wallet?.withdrawals || [];
  const filtered = filter === 'all' ? history : history.filter((item) => item.status === filter);

  const amount = parseFloat(withdrawAmount);
  const validAmount = Number.isFinite(amount) && amount > 0 && amount <= totals.balance;
  const fee = validAmount || amount > 0 ? Math.round(amount * WITHDRAWAL_FEE_RATE * 100) / 100 : 0;
  const net = validAmount || amount > 0 ? Math.round((amount - fee) * 100) / 100 : 0;

  const openWithdraw = () => {
    setWithdrawAmount('');
    setWithdrawMethod('bank_transfer');
    setWithdrawApiError('');
    setShowWithdraw(true);
  };

  const closeWithdraw = () => {
    if (withdrawBusy) return;
    setShowWithdraw(false);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!validAmount) return;
    setWithdrawBusy(true);
    setWithdrawApiError('');
    try {
      const data = await sellerService.createWithdrawal(Number(amount.toFixed(2)), withdrawMethod);
      setReceipt(data.withdrawal);
      setShowWithdraw(false);
      await fetchWallet();
    } catch (err) {
      setWithdrawApiError(err.response?.data?.message || 'Could not process your withdrawal.');
    } finally {
      setWithdrawBusy(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const stats = [
    {
      label: 'Total profit',
      value: totals.totalRevenue,
      icon: TrendingUp,
      className: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'To ship',
      value: totals.pending,
      icon: RefreshCw,
      className: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Shipped',
      value: totals.shipped,
      icon: Truck,
      className: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Cancelled',
      value: totals.cancelled,
      icon: Ban,
      className: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight text-slate-900">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Wallet size={24} />
            </span>
            Wallet
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track your earnings, withdraw your balance, and view your transaction history.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Available balance</p>
          <p data-testid="wallet-balance" className="mt-1 text-3xl font-bold text-emerald-600">
            {formatPrice(totals.balance)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={openWithdraw}
              data-testid="withdraw-button"
              disabled={totals.balance <= 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Banknote size={14} /> Withdraw
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {totals.withdrawn > 0
              ? `${formatPrice(totals.withdrawn)} withdrawn total`
              : `${totals.unitsSold} unit${totals.unitsSold === 1 ? '' : 's'} sold`}
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-testid={`wallet-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft"
          >
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${stat.className}`}>
              <stat.icon size={22} />
            </span>
            <p className="mt-4 text-2xl font-bold text-slate-900">{formatPrice(stat.value)}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-7 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Banknote size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Withdrawals</h2>
              <p className="text-xs text-slate-500">
                {withdrawals.length} withdrawal{withdrawals.length === 1 ? '' : 's'} · receipts are available for each
              </p>
            </div>
          </div>
        </div>

        {withdrawals.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Gift size={26} />
            </span>
            <p data-testid="withdrawals-empty" className="mt-4 font-semibold text-slate-900">
              No withdrawals yet
            </p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              When you withdraw your balance, a receipt is issued and the request is recorded here.
            </p>
          </div>
        ) : (
          <ul data-testid="withdrawals-list" className="divide-y divide-slate-100">
            {withdrawals.map((item) => (
              <li
                key={item.id}
                data-testid="withdrawal-entry"
                className="flex flex-wrap items-center gap-4 px-7 py-4"
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                    item.status === 'completed' || item.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-600'
                      : item.status === 'rejected' || item.status === 'cancelled'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Banknote size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {formatPrice(item.amount)} · {METHOD_CONFIG[item.method]?.label || item.method}
                  </p>
                  <p className="text-sm text-slate-500">
                    Receipt <span className="font-mono font-semibold">{item.receiptNumber}</span>
                    {item.fee > 0 && <span> · fee {formatPrice(item.fee)}</span>}
                  </p>
                  <p data-testid="withdrawal-time" className="mt-0.5 text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                    {item.processedAt && (
                      <span className="ml-1">· settled {new Date(item.processedAt).toLocaleString()}</span>
                    )}
                  </p>
                  {item.adminNote && (
                    <p className="mt-0.5 text-xs font-medium text-slate-500">Admin note: {item.adminNote}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      WITHDRAWAL_BADGE[item.status] || WITHDRAWAL_BADGE.processing
                    }`}
                  >
                    {item.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReceipt(item)}
                    data-testid={`view-receipt-${item.id}`}
                    className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    <Receipt size={12} /> View receipt
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-7 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Clock3 size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Transaction history</h2>
              <p className="text-xs text-slate-500">
                {filtered.length} transaction{filtered.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                data-testid={`wallet-filter-${item.key}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === item.key
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <PackageX size={26} />
            </span>
            <p data-testid="wallet-empty" className="mt-4 font-semibold text-slate-900">
              No transactions
            </p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Sales from your orders will appear here as transaction history.
            </p>
          </div>
        ) : (
          <ul data-testid="wallet-history" className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <li key={item.id} data-testid="wallet-transaction" className="flex flex-wrap items-center gap-5 px-7 py-5">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{item.product.name}</p>
                  <p className="text-sm text-slate-500">
                    Order #{item.orderId.slice(-8).toUpperCase()} · {item.customer.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <Package size={12} /> {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      statusBadge[item.status] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status === 'cancelled' ? (
                      <ArrowDownRight size={12} />
                    ) : (
                      <ArrowUpRight size={12} />
                    )}
                    {statusLabel[item.status] || item.status}
                  </p>
                  <p className={`mt-1 text-lg font-bold ${item.status === 'cancelled' ? 'text-red-500' : 'text-slate-900'}`}>
                    {item.status === 'cancelled' ? '−' : ''}
                    {formatPrice(item.amount)}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={handleWithdraw} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Withdraw funds</h2>
              <button
                type="button"
                onClick={closeWithdraw}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Available balance: <span className="font-semibold text-emerald-600">{formatPrice(totals.balance)}</span>
            </p>

            {withdrawApiError && <div className="mt-3"><Alert type="error" message={withdrawApiError} /></div>}

            <label htmlFor="withdraw-amount" className="mt-4 block text-sm font-semibold text-slate-700">
              Amount
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">₱</span>
              <input
                id="withdraw-amount"
                type="number"
                min="1"
                max={totals.balance}
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                data-testid="withdraw-amount"
                className="input-field w-full pl-8 pr-16"
                required
              />
              <button
                type="button"
                onClick={() => setWithdrawAmount(String(Number(totals.balance.toFixed(2))))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                MAX
              </button>
            </div>
            {amount > 0 && !validAmount && (
              <p className="mt-1 text-xs font-medium text-red-500">Amount exceeds your available balance.</p>
            )}

            <p className="mt-4 text-sm font-semibold text-slate-700">Method</p>
            <div className="mt-1.5 grid gap-2">
              {WITHDRAWAL_METHODS.map((key) => (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                    withdrawMethod === key
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="withdraw-method"
                    value={key}
                    checked={withdrawMethod === key}
                    onChange={() => setWithdrawMethod(key)}
                    className="accent-emerald-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{METHOD_CONFIG[key].label}</p>
                    <p className="text-xs text-slate-500">{METHOD_CONFIG[key].desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {amount > 0 && (
              <div className="mt-4 space-y-1 rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Amount</span>
                  <span>{formatPrice(amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Processing fee (2%)</span>
                  <span>− {formatPrice(fee)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                  <span>You receive</span>
                  <span>{formatPrice(net)}</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={closeWithdraw} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={!validAmount || withdrawBusy} data-testid="submit-withdraw" className="btn-primary">
                {withdrawBusy ? <Spinner label="Processing..." /> : 'Withdraw funds'}
              </button>
            </div>
          </form>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl print:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Receipt size={20} className="text-emerald-600" /> Withdrawal receipt
              </h2>
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 print:hidden"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div data-testid="withdrawal-receipt" className="px-6 py-6">
              {receipt.status === 'completed' && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={18} /> Withdrawal completed
                </div>
              )}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-500">Amount</p>
                <p className="mt-1 text-4xl font-bold text-emerald-600">{formatPrice(receipt.amount)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  net {formatPrice((receipt.amount || 0) - (receipt.fee || 0))} after fee
                </p>
              </div>

              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Receipt number</dt>
                  <dd className="font-mono font-semibold text-slate-900">{receipt.receiptNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Method</dt>
                  <dd className="font-semibold text-slate-900">{METHOD_CONFIG[receipt.method]?.label || receipt.method}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-semibold text-slate-900 capitalize">{receipt.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Date and time</dt>
                  <dd data-testid="receipt-time" className="font-semibold text-slate-900">
                    {new Date(receipt.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2.5">
                  <dt className="text-slate-500">Processing fee (2%)</dt>
                  <dd className="font-semibold text-slate-900">− {formatPrice(receipt.fee || 0)}</dd>
                </div>
              </dl>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 print:hidden">
              <button type="button" onClick={() => setReceipt(null)} className="btn-secondary">
                Done
              </button>
              <button type="button" onClick={printReceipt} data-testid="print-receipt" className="btn-primary">
                <Download size={15} /> Print / Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerWalletPage;