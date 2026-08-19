import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, CheckCircle2, XCircle, Clock3, Trash2, Ban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { adminReportService } from '../services/reportService';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved: { label: 'Resolved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  dismissed: { label: 'Dismissed', className: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const targetLabel = {
  product: 'Product',
  review: 'Review',
};

function AdminReportsPage() {
  const checked = useRequireAuth();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

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
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminReportService.getReports(filter === 'all' ? undefined : filter);
        setReports(data.reports);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [checked, filter, user?.role]);

  if (!checked) return null;

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Admins only</h1>
        <p className="mt-2 text-slate-500">You need an admin account to review reports.</p>
      </div>
    );
  }

  const handleAction = async (report, action) => {
    setApiError('');
    setUpdatingId(report.id);
    try {
      if (action === 'resolve') {
        await adminReportService.resolveReport(report.id);
      } else {
        await adminReportService.dismissReport(report.id);
      }
      setConfirmId(null);
      setReports((prev) => prev.filter((item) => item.id !== report.id));
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not update this report.');
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs = [
    { key: 'pending', label: 'Pending' },
    { key: 'all', label: 'All' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'dismissed', label: 'Dismissed' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-purple-50 text-purple-600">
          <Flag size={24} />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Review reported products and comments.</p>
        </div>
      </div>

      <div className="mt-8">
        {apiError && <Alert type="error" message={apiError} />}
        {error && <Alert type="error" message={error} />}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            data-testid={`tab-${tab.key}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              filter === tab.key
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div
          data-testid="no-reports"
          className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center"
        >
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Clock3 size={28} />
          </span>
          <p className="mt-4 font-semibold text-slate-900">No reports</p>
          <p className="mt-1 text-sm text-slate-500">Nothing to review right now.</p>
        </div>
      ) : (
        <ul data-testid="report-list" className="mt-8 space-y-4">
          {reports.map((report) => {
            const status = statusConfig[report.status] || statusConfig.pending;
            return (
              <li
                key={report.id}
                data-testid="report-card"
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {targetLabel[report.targetType] || report.targetType} report
                      </h2>
                      <span
                        data-testid="report-status"
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Reported by {report.reporter.firstName} {report.reporter.lastName} ·{' '}
                      {new Date(report.createdAt).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm">
                  <span className="font-semibold text-amber-800">Reason: </span>
                  <span className="text-amber-700">{report.reason}</span>
                </div>

                {report.target ? (
                  <div className="mt-3 rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Reported {report.targetType}
                    </p>
                    {report.targetType === 'product' ? (
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={report.target.data.image}
                          alt={report.target.data.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{report.target.data.name}</p>
                          <p className="text-xs text-slate-500">
                            ₱{Number(report.target.data.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">★ {report.target.data.rating}/5</span>
                          <span className="text-sm font-medium text-slate-700">
                            {report.target.data.author}
                          </span>
                        </div>
                        {report.target.data.imageUrl && (
                          <img
                            src={report.target.data.imageUrl}
                            alt="Review"
                            className="mt-2 h-24 w-40 rounded-lg object-cover"
                          />
                        )}
                        <p className="mt-1 text-sm text-slate-600">{report.target.data.comment}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                    The reported {report.targetType} has already been removed.
                  </p>
                )}

                {report.status === 'pending' && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {confirmId === report.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction(report, 'resolve')}
                          disabled={updatingId === report.id}
                          data-testid="confirm-resolve"
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          {updatingId === report.id ? (
                            <Spinner label="Removing..." />
                          ) : (
                            'Yes, remove it'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="btn-secondary px-4 py-2 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setConfirmId(report.id)}
                          disabled={updatingId === report.id}
                          data-testid="resolve-report"
                          className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                        >
                          <Trash2 size={16} /> Remove {report.targetType}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(report, 'dismiss')}
                          disabled={updatingId === report.id}
                          data-testid="dismiss-report"
                          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <Ban size={16} /> Dismiss report
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AdminReportsPage;
