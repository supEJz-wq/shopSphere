import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Package, ShoppingCart, TrendingUp, Plus, ArrowRight, PackageX, Upload, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { sellerService } from '../services/sellerService';
import { formatPrice } from '../utils/formatPrice';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

function SellerDashboardPage() {
  const checked = useRequireAuth();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [successMessage, setSuccessMessage] = useState('');

  const [appealFor, setAppealFor] = useState(null);
  const [appealReason, setAppealReason] = useState('');
  const [appealImageFile, setAppealImageFile] = useState(null);
  const [appealImagePreview, setAppealImagePreview] = useState('');
  const [appealError, setAppealError] = useState('');
  const [appealBusy, setAppealBusy] = useState(false);

  const [replyToWarningId, setReplyToWarningId] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyImageFile, setReplyImageFile] = useState(null);
  const [replyImagePreview, setReplyImagePreview] = useState('');
  const [replyError, setReplyError] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);

  useEffect(() => {
    if (!checked) return;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const freshUser = await refreshUser();
        if (freshUser.role !== 'seller') {
          navigate('/seller/apply', { replace: true });
          return;
        }
        const data = await sellerService.getDashboard();
        setDashboard(data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError(err.response?.data?.message || 'Your shop has been banned. Contact support for assistance.');
          return;
        }
        setError(err.response?.data?.message || 'Could not load your dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [checked, navigate, refreshUser]);

  const openAppeal = (targetType, product = null) => {
    setAppealFor({ targetType, product });
    setAppealReason('');
    setAppealImageFile(null);
    setAppealImagePreview('');
    setAppealError('');
  };

  const handleAppealImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAppealError('Only JPG, PNG, or WebP images are allowed.');
      return;
    }
    setAppealError('');
    setAppealImageFile(file);
    setAppealImagePreview(URL.createObjectURL(file));
  };

  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    if (!appealFor) return;
    setAppealBusy(true);
    setAppealError('');
    try {
      await sellerService.createAppeal(
        appealFor.targetType,
        appealFor.targetType === 'product' ? appealFor.product.id : undefined,
        appealReason,
        appealImageFile
      );
      setAppealFor(null);
      setSuccessMessage('Your appeal has been submitted. An admin will review it.');
      const data = await sellerService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setAppealError(err.response?.data?.message || 'Could not submit your appeal.');
    } finally {
      setAppealBusy(false);
    }
  };

  const openWarningReply = (warningId) => {
    setReplyToWarningId(warningId);
    setReplyMessage('');
    setReplyImageFile(null);
    setReplyImagePreview('');
    setReplyError('');
  };

  const handleReplyImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setReplyError('Only JPG, PNG, or WebP images are allowed.');
      return;
    }
    setReplyError('');
    setReplyImageFile(file);
    setReplyImagePreview(URL.createObjectURL(file));
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyToWarningId) return;
    setReplyBusy(true);
    setReplyError('');
    try {
      await sellerService.replyToWarning(replyToWarningId, replyMessage, replyImageFile);
      setReplyToWarningId(null);
      setSuccessMessage('Your reply has been sent to the admin.');
      const data = await sellerService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setReplyError(err.response?.data?.message || 'Could not send your reply.');
    } finally {
      setReplyBusy(false);
    }
  };

  if (!checked) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <div className="mt-10 grid grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-28 w-full rounded-2xl" />
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

  const role = user?.role;
  const totals = dashboard?.totals || { products: 0, orders: 0, soldQuantity: 0 };
  const bannedProducts = (dashboard?.products || []).filter((product) => product.status === 'banned');
  const latestAppealStatus = (productId) => {
    const appeals = (dashboard?.banAppeals || []).filter(
      (appeal) => appeal.targetType === 'product' && appeal.product?.id === productId
    );
    return appeals[appeals.length - 1]?.status || null;
  };

  const hasWarnings = (dashboard?.warnings?.length || 0) > 0;
  const hasBans = !!(dashboard?.profile?.isBanned || bannedProducts.length > 0);
  const hasModeration = hasWarnings || hasBans;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Seller Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            {`Welcome back, ${dashboard?.profile?.firstName || ''}! Manage your store and orders.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {dashboard?.profile?.isBanned && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              Banned
            </span>
          )}
          {dashboard?.application?.status === 'approved' && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Approved seller
            </span>
          )}
        </div>
      </div>

      <div className={`mt-10 ${hasModeration ? 'grid gap-10 lg:grid-cols-[320px_1fr]' : ''}`}>
        {hasModeration && (
          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          {dashboard?.warnings?.length > 0 && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-amber-100 text-amber-700">
                    <AlertTriangle size={13} />
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wide text-amber-900">Warnings</h2>
                </div>
                <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  {dashboard.warnings.length}
                </span>
              </div>
              <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
                {dashboard.warnings.map((warning) => (
                  <li key={warning.id} className="rounded-lg border border-amber-200 bg-white/70 p-2.5">
                    <p className="line-clamp-2 text-xs font-medium text-amber-900">{warning.message}</p>
                    <p className="mt-0.5 text-[11px] text-amber-600">
                      {new Date(warning.createdAt).toLocaleDateString()} · {warning.replies?.length || 0} reply
                      {warning.replies?.length === 1 ? '' : 's'}
                    </p>
                    {warning.replies?.length > 0 && (
                      <ul className="mt-2 space-y-1.5 border-t border-amber-200 pt-2">
                        {warning.replies.map((reply) => (
                          <li key={reply.id}>
                            <p className="line-clamp-2 text-[11px] text-amber-800">{reply.message}</p>
                            {reply.imageUrl && (
                              <a href={reply.imageUrl} target="_blank" rel="noreferrer">
                                <img
                                  src={reply.imageUrl}
                                  alt="Proof"
                                  className="mt-1 h-14 w-20 rounded-md object-cover border border-amber-300"
                                />
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      onClick={() => openWarningReply(warning.id)}
                      data-testid={`reply-warning-${warning.id}`}
                      className="mt-2 w-full rounded-md border border-amber-300 bg-white px-2 py-1 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                      Reply with proof
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(dashboard?.profile?.isBanned || bannedProducts.length > 0) && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-red-100 text-red-600">
                    <AlertTriangle size={13} />
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wide text-red-900">Moderation</h2>
                </div>
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  {(dashboard?.profile?.isBanned ? 1 : 0) + bannedProducts.length}
                </span>
              </div>

              {bannedProducts.length > 0 && (
                <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
                  {bannedProducts.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center gap-2 rounded-lg border border-red-200 bg-white/70 p-2"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-9 w-9 shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-red-900">{product.name}</p>
                        <p className="text-[11px] text-red-600">
                          {latestAppealStatus(product.id) || 'Banned — no appeal yet'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAppeal('product', product)}
                        data-testid={`appeal-product-${product.id}`}
                        className="shrink-0 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-100"
                      >
                        Appeal
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {dashboard?.profile?.isBanned && (
                <div className="mt-2 rounded-lg border border-red-200 bg-white/70 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-red-900">Shop banned</p>
                    <button
                      type="button"
                      onClick={() => openAppeal('shop')}
                      data-testid="appeal-shop-ban"
                      className="rounded-md bg-red-600 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      Appeal
                    </button>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-red-700">
                    Your store is hidden from customers.
                  </p>
                </div>
              )}

              {dashboard?.banAppeals?.length > 0 && (
                <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto border-t border-red-200 pt-2 pr-1">
                  {dashboard.banAppeals.map((appeal) => (
                    <li key={appeal.id} className="flex items-center justify-between gap-2 text-[11px] text-red-800">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          appeal.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : appeal.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {appeal.status}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {appeal.targetType === 'shop'
                          ? 'Shop appeal'
                          : `Product appeal${appeal.product ? ` — ${appeal.product.name}` : ''}`}
                      </span>
                      <span className="shrink-0 text-red-500">
                        {new Date(appeal.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

        </aside>
        )}

        <div className="min-w-0 space-y-10">
          {successMessage && <Alert type="success" message={successMessage} />}
          {error && <Alert type="error" message={error} />}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div data-testid="stat-products" className="rounded-2xl border border-slate-100 bg-white p-8 shadow-soft">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Package size={22} />
          </span>
          <p className="mt-4 text-2xl font-bold text-slate-900">{totals.products}</p>
          <p className="text-sm text-slate-500">Products</p>
        </div>
        <div data-testid="stat-orders" className="rounded-2xl border border-slate-100 bg-white p-8 shadow-soft">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <ShoppingCart size={22} />
          </span>
          <p className="mt-4 text-2xl font-bold text-slate-900">{totals.orders}</p>
          <p className="text-sm text-slate-500">Orders received</p>
        </div>
        <div data-testid="stat-sold" className="rounded-2xl border border-slate-100 bg-white p-8 shadow-soft">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp size={22} />
          </span>
          <p className="mt-4 text-2xl font-bold text-slate-900">{totals.soldQuantity}</p>
          <p className="text-sm text-slate-500">Units sold</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-primary/5 px-7 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
              <Package size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Products</h2>
              <p className="text-xs text-slate-500">
                {dashboard?.products?.length || 0} product{dashboard?.products?.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <Link
            to="/seller/products"
            data-testid="manage-products"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Manage products <ArrowRight size={14} />
          </Link>
        </div>

        <div data-testid="seller-products" className="px-7 py-6">
          {dashboard?.products?.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <PackageX size={30} />
              </span>
              <p className="mt-4 text-lg font-bold text-slate-900">No products yet</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Start selling by adding your first product.
              </p>
              <Link
                to="/seller/products"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                <Plus size={16} /> Add a product
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {dashboard.products.map((product) => (
                <li key={product.id} data-testid="seller-product" className="flex flex-wrap items-center gap-5 py-5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">
                      {product.category}
                      {product.status === 'banned' && (
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                          Banned
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatPrice(product.price)}</p>
                    <p className="text-sm text-slate-500">{product.stock} in stock</p>
                  </div>
                  {product.status === 'banned' && (
                    <button
                      type="button"
                      onClick={() => openAppeal('product', product)}
                      data-testid={`appeal-product-${product.id}`}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                    >
                      Appeal
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <aside className="flex flex-col overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-blue-50/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
              <ShoppingCart size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent orders</h2>
              <p className="text-xs text-slate-500">
                {dashboard?.orders?.length || 0} order{dashboard?.orders?.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <Link
            to="/seller/orders"
            data-testid="manage-orders"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Manage orders <ArrowRight size={14} />
          </Link>
        </div>
        {dashboard?.orders?.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <PackageX size={26} />
            </span>
            <p data-testid="no-orders" className="mt-4 font-semibold text-slate-900">
              No orders yet
            </p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Orders for your products will show up here.
            </p>
          </div>
        ) : (
          <ul data-testid="seller-orders" className="max-h-[32rem] flex-1 divide-y divide-slate-100 overflow-y-auto">
            {dashboard.orders.map((order) => (
              <li key={order.orderId} data-testid="seller-order" className="flex flex-wrap items-center gap-5 px-6 py-5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">Order #{order.orderId.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-slate-500">{order.customer.name}</p>
                  <p className="text-sm font-semibold text-slate-700">{formatPrice(order.total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">
                    {order.items.length} product{order.items.length === 1 ? '' : 's'}
                  </p>
                  <Link to={`/orders/${order.orderId}`} data-testid="view-order" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                    View <ArrowRight size={14} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
      </div>
        </div>
      </div>

      {appealFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={handleAppealSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Appeal ban</h2>
              <button
                type="button"
                onClick={() => setAppealFor(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {appealFor.targetType === 'shop'
                ? 'Your shop is banned. Explain why it should be unbanned.'
                : `"${appealFor.product?.name}" is banned. Explain why it should be restored.`}
            </p>
            {appealError && <div className="mt-3"><Alert type="error" message={appealError} /></div>}
            <textarea
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              rows={4}
              placeholder="Explain your situation and why the ban should be lifted..."
              data-testid="appeal-reason"
              className="input-field mt-4 resize-none"
              required
              minLength={10}
            />
            <div className="mt-3">
              <label
                htmlFor="appeal-proof-image"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-primary hover:text-primary"
              >
                <Upload size={16} />
                {appealImagePreview ? 'Change proof photo' : 'Upload proof photo (optional)'}
                <input
                  id="appeal-proof-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAppealImageChange}
                  data-testid="appeal-proof-image"
                  className="hidden"
                />
              </label>
              {appealImagePreview && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={appealImagePreview} alt="Proof preview" className="h-20 w-32 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setAppealImageFile(null);
                      setAppealImagePreview('');
                    }}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP up to 5MB.</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setAppealFor(null)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={appealBusy} data-testid="submit-appeal" className="btn-primary">
                {appealBusy ? <Spinner label="Submitting..." /> : 'Submit appeal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {replyToWarningId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={handleReplySubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Reply to warning</h2>
              <button
                type="button"
                onClick={() => setReplyToWarningId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Explain how you fixed the issue and attach a photo as proof (optional).
            </p>
            {replyError && <div className="mt-3"><Alert type="error" message={replyError} /></div>}
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={3}
              placeholder="Describe the action you have taken..."
              data-testid="reply-message"
              className="input-field mt-4 resize-none"
              required
              minLength={5}
            />
            <div className="mt-3">
              <label
                htmlFor="reply-proof-image"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-amber-400 hover:text-amber-700"
              >
                <Upload size={16} />
                {replyImagePreview ? 'Change proof photo' : 'Upload proof photo'}
                <input
                  id="reply-proof-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleReplyImageChange}
                  data-testid="reply-proof-image"
                  className="hidden"
                />
              </label>
              {replyImagePreview && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={replyImagePreview} alt="Proof preview" className="h-20 w-32 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setReplyImageFile(null);
                      setReplyImagePreview('');
                    }}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP up to 5MB.</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setReplyToWarningId(null)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={replyBusy} data-testid="submit-warning-reply" className="btn-primary">
                {replyBusy ? <Spinner label="Sending..." /> : 'Send reply'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SellerDashboardPage;