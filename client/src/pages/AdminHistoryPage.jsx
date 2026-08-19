import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, AlertTriangle, Ban, ShieldCheck, PackageX, Package, RotateCcw, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { adminService } from '../services/adminService';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';

const ACTION_CONFIG = {
  warn: { label: 'Warning sent', icon: AlertTriangle, className: 'bg-amber-50 text-amber-600 border-amber-200' },
  remove_warning: { label: 'Warning removed', icon: Trash2, className: 'bg-orange-50 text-orange-600 border-orange-200' },
  ban: { label: 'Shop banned', icon: Ban, className: 'bg-red-50 text-red-600 border-red-200' },
  unban: { label: 'Shop unbanned', icon: ShieldCheck, className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  ban_product: { label: 'Product banned', icon: PackageX, className: 'bg-red-50 text-red-600 border-red-200' },
  unban_product: { label: 'Product unbanned', icon: Package, className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
};

const ACTION_FILTERS = [
  { key: 'all', label: 'All actions' },
  { key: 'warn', label: 'Warnings' },
  { key: 'remove_warning', label: 'Removed warnings' },
  { key: 'ban', label: 'Bans' },
  { key: 'unban', label: 'Unbans' },
  { key: 'ban_product', label: 'Product bans' },
  { key: 'unban_product', label: 'Product unbans' },
];

const defaultConfig = { label: 'Action', icon: History, className: 'bg-slate-50 text-slate-600 border-slate-200' };

function AdminHistoryPage() {
  const checked = useRequireAuth();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [action, setAction] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

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
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getHistory({ search, action });
        setHistory(data.history);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load moderation history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [checked, action, search, user?.role]);

  if (!checked) return null;

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Admins only</h1>
        <p className="mt-2 text-slate-500">You need an admin account to view moderation history.</p>
      </div>
    );
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-10">
      <div>
        <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight text-slate-900">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <History size={24} />
          </span>
          Moderation History
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          A documented log of every warning, unban, and moderation action performed by admins.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search seller, store, product..."
            data-testid="history-search"
            className="input-field w-full pl-10 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSearchInput('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </form>
        <div className="flex flex-wrap gap-2">
          {ACTION_FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setAction(item.key)}
              data-testid={`history-filter-${item.key}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                action === item.key
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mt-6"><Alert type="error" message={error} /></div>}

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
          {history.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-20 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <History size={30} />
              </span>
              <p data-testid="history-empty" className="mt-4 text-lg font-bold text-slate-900">
                No history yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                When admins send warnings, remove warnings, ban or unban shops and products, the actions will be documented here.
              </p>
            </div>
          ) : (
            <ul data-testid="history-list" className="divide-y divide-slate-100">
              {history.map((entry) => {
                const cfg = ACTION_CONFIG[entry.action] || defaultConfig;
                const Icon = cfg.icon;
                const target = entry.product
                  ? entry.product.name
                  : entry.seller
                    ? entry.seller.storeName || entry.seller.name
                    : 'Unknown';
                return (
                  <li key={entry.id} data-testid="history-entry" className="flex flex-wrap items-center gap-4 px-7 py-5">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${cfg.className}`}
                    >
                      <Icon size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}
                        >
                          {cfg.label}
                        </span>
                        <p className="font-semibold text-slate-900">{target}</p>
                      </div>
                      {entry.message && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">"{entry.message}"</p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-400">
                        {entry.seller?.email || (entry.product ? 'Product' : '')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-700">by {entry.admin || 'Admin'}</p>
                      <p className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export default AdminHistoryPage;