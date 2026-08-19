import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle2, XCircle, Clock3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { adminService } from '../services/adminService';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-600 border-red-200' },
};

function AdminApplicationsPage() {
  const checked = useRequireAuth();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [apiError, setApiError] = useState('');
  const [showRejectNote, setShowRejectNote] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    if (!checked) return;

    const checkAdmin = async () => {
      try {
        const freshUser = await refreshUser();
        if (freshUser.role !== 'admin') {
          navigate('/', { replace: true });
        }
      } catch {
        navigate('/login', { replace: true });
      }
    };
    checkAdmin();
  }, [checked, navigate, refreshUser]);

  useEffect(() => {
    if (!checked || user?.role !== 'admin') return;

    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getApplications(filter === 'all' ? undefined : filter);
        setApplications(data.applications);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [checked, filter, user?.role]);

  if (!checked) return null;

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Admins only</h1>
        <p className="mt-2 text-slate-500">You need an admin account to review applications.</p>
      </div>
    );
  }

  const handleReview = async (application, status) => {
    setApiError('');
    setUpdatingId(application.id);
    try {
      await adminService.reviewApplication(application.id, {
        status,
        note: status === 'rejected' ? rejectNote.trim() || undefined : undefined,
      });
      setShowRejectNote(null);
      setRejectNote('');
      setApplications((prev) => prev.filter((app) => app.id !== application.id));
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not update this application.');
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs = [
    { key: 'pending', label: 'Pending' },
    { key: 'all', label: 'All' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-purple-50 text-purple-600">
          <ClipboardList size={24} />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Seller Applications</h1>
          <p className="text-sm text-slate-500">Approve or reject requests to become a seller.</p>
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
      ) : applications.length === 0 ? (
        <div
          data-testid="no-applications"
          className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center"
        >
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Clock3 size={28} />
          </span>
          <p className="mt-4 font-semibold text-slate-900">No {filter !== 'all' ? filter : ''} applications</p>
          <p className="mt-1 text-sm text-slate-500">Nothing to review right now.</p>
        </div>
      ) : (
        <ul data-testid="application-list" className="mt-8 space-y-4">
          {applications.map((application) => {
            const status = statusConfig[application.status] || statusConfig.pending;
            return (
              <li
                key={application.id}
                data-testid="application-card"
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{application.storeName}</h2>
                      <span
                        data-testid="application-status"
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{application.businessEmail}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Applicant: {application.user.firstName} {application.user.lastName} · Applied{' '}
                      {new Date(application.createdAt).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">{application.description}</p>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Identity verification
                  </p>
                  <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">Phone number</dt>
                      <dd data-testid="application-phone" className="font-semibold text-slate-900">
                        {application.phoneNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Valid ID 1</dt>
                      <dd data-testid="application-id1" className="font-semibold text-slate-900">
                        {application.idType} — {application.idNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Valid ID 2</dt>
                      <dd data-testid="application-id2" className="font-semibold text-slate-900">
                        {application.secondIdType} — {application.secondIdNumber}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      { key: 'idFrontUrl', label: `${application.idType} front` },
                      { key: 'idBackUrl', label: `${application.idType} back` },
                      { key: 'secondIdFrontUrl', label: `${application.secondIdType} front` },
                      { key: 'secondIdBackUrl', label: `${application.secondIdType} back` },
                    ].map(({ key, label }) => (
                      <a
                        key={key}
                        href={application[key]}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded-xl border border-slate-200 transition hover:border-primary"
                      >
                        <img
                          src={application[key]}
                          alt={label}
                          data-testid={`application-photo-${key}`}
                          className="h-28 w-full object-cover"
                        />
                        <p className="bg-white px-2 py-1.5 text-center text-[11px] font-medium text-slate-500">
                          {label}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>

                {application.reviewNote && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                    <span className="font-semibold">Note: </span>
                    {application.reviewNote}
                  </div>
                )}

                {application.status === 'pending' && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    {showRejectNote === application.id ? (
                      <div className="flex-1">
                        <label htmlFor="reject-note" className="label-field">Reason (optional)</label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            id="reject-note"
                            type="text"
                            value={rejectNote}
                            onChange={(event) => setRejectNote(event.target.value)}
                            placeholder="Why is this being rejected?"
                            data-testid="reject-note"
                            className="input-field flex-1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="hidden sm:block" />
                    )}

                    <div className="flex gap-2">
                      {showRejectNote === application.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowRejectNote(null);
                            setRejectNote('');
                          }}
                          data-testid="cancel-reject"
                          className="btn-secondary px-4 py-2 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (showRejectNote !== application.id) {
                            setShowRejectNote(application.id);
                            setRejectNote('');
                            setApiError('');
                            return;
                          }
                          handleReview(application, 'rejected');
                        }}
                        disabled={updatingId === application.id}
                        data-testid="reject-application"
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        {updatingId === application.id ? <Spinner label="" /> : <XCircle size={16} />}
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview(application, 'approved')}
                        disabled={updatingId === application.id}
                        data-testid="approve-application"
                        className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updatingId === application.id ? <Spinner label="" /> : <CheckCircle2 size={16} />}
                        Approve
                      </button>
                    </div>
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

export default AdminApplicationsPage;