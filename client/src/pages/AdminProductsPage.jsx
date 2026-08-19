import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, PackageX, Star, Ban, ShieldCheck, AlertTriangle, X, Store, Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { adminService } from '../services/adminService';
import { formatPrice } from '../utils/formatPrice';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const categories = ['Laptop', 'Smartphone', 'Headphones', 'Accessories'];

function AdminProductsPage() {
  const checked = useRequireAuth();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [tab, setTab] = useState('products');

  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [appealFilter, setAppealFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [shop, setShop] = useState('');
  const [category, setCategory] = useState('');
  const [productStatus, setProductStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [applied, setApplied] = useState(false);

  const [warnSellerId, setWarnSellerId] = useState(null);
  const [warnMessage, setWarnMessage] = useState('');

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

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getProducts({ search, shop, category, status: productStatus });
      setProducts(data.products);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getSellers({ search, status: statusFilter });
      setSellers(data.sellers);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load sellers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAppeals({ status: appealFilter });
      setAppeals(data.appeals);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load appeals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checked || user?.role !== 'admin') return;
    if (tab === 'products') {
      fetchProducts();
    } else if (tab === 'sellers') {
      fetchSellers();
    } else {
      fetchAppeals();
    }
  }, [checked, user?.role, tab, applied, appealFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!checked) return null;

  const applyFilters = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setApplied((prev) => !prev);
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setShop('');
    setCategory('');
    setProductStatus('');
    setStatusFilter('all');
    setApplied((prev) => !prev);
  };

  const handleProductToggle = async (product) => {
    setBusyId(product.id);
    setApiError('');
    setSuccessMessage('');
    try {
      if (product.status === 'banned') {
        await adminService.unbanProduct(product.id);
        setSuccessMessage(`"${product.name}" is now active.`);
      } else {
        await adminService.banProduct(product.id);
        setSuccessMessage(`"${product.name}" has been banned.`);
      }
      setApplied((prev) => !prev);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not update the product.');
    } finally {
      setBusyId(null);
    }
  };

  const handleSellerToggle = async (seller) => {
    setBusyId(seller.id);
    setApiError('');
    setSuccessMessage('');
    try {
      if (seller.isBanned) {
        await adminService.unbanSeller(seller.id);
        setSuccessMessage(`"${seller.storeName || seller.name}" has been unbanned.`);
      } else {
        await adminService.banSeller(seller.id);
        setSuccessMessage(`"${seller.storeName || seller.name}" has been banned.`);
      }
      setApplied((prev) => !prev);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not update the seller.');
    } finally {
      setBusyId(null);
    }
  };

  const handleWarn = async (e) => {
    e.preventDefault();
    if (!warnSellerId) return;
    setBusyId(warnSellerId);
    setApiError('');
    setSuccessMessage('');
    try {
      await adminService.warnSeller(warnSellerId, warnMessage);
      setSuccessMessage('Warning sent to the seller.');
      setWarnSellerId(null);
      setWarnMessage('');
      setApplied((prev) => !prev);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not send the warning.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveWarning = async (warning) => {
    setBusyId(warning.id);
    setApiError('');
    setSuccessMessage('');
    try {
      await adminService.removeWarning(warning.id);
      setSuccessMessage('Warning removed.');
      setApplied((prev) => !prev);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not remove the warning.');
    } finally {
      setBusyId(null);
    }
  };

  const handleAppealReview = async (appeal, decision) => {
    setBusyId(appeal.id);
    setApiError('');
    setSuccessMessage('');
    try {
      await adminService.reviewAppeal(appeal.id, { decision });
      setSuccessMessage(decision === 'approved' ? 'Appeal approved — ban lifted.' : 'Appeal rejected.');
      setApplied((prev) => !prev);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not review this appeal.');
    } finally {
      setBusyId(null);
    }
  };

  const tabClass = (key) =>
    `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
      tab === key
        ? 'bg-slate-900 text-white'
        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <PackageX size={24} />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Moderation</h1>
            <p className="text-sm text-slate-500">Search shops and products, review them, and ban when there is a problem.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setTab('products')} className={tabClass('products')}>
            <PackageX size={15} /> Products
          </button>
          <button type="button" onClick={() => setTab('sellers')} className={tabClass('sellers')}>
            <Store size={15} /> Shops
          </button>
          <button type="button" onClick={() => setTab('appeals')} className={tabClass('appeals')}>
            <Scale size={15} /> Appeals
          </button>
        </div>
      </div>

      <div className="mt-6">
        {successMessage && <Alert type="success" message={successMessage} />}
        {apiError && <Alert type="error" message={apiError} />}
        {error && <Alert type="error" message={error} />}
      </div>

      <form onSubmit={applyFilters} className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="admin-product-search" className="label-field">
              {tab === 'products' ? 'Search products' : 'Search shops'}
            </label>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="admin-product-search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={tab === 'products' ? 'Product name or description...' : 'Shop name, seller name, or email...'}
                data-testid="admin-product-search"
                className="input-field pl-9"
              />
            </div>
          </div>

          {tab === 'products' ? (
            <>
              <div>
                <label htmlFor="admin-product-shop" className="label-field">Shop</label>
                <input
                  id="admin-product-shop"
                  type="text"
                  value={shop}
                  onChange={(e) => setShop(e.target.value)}
                  placeholder="Store name..."
                  data-testid="admin-product-shop"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="admin-product-category" className="label-field">Category</label>
                <select
                  id="admin-product-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  data-testid="admin-product-category"
                  className="input-field"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="admin-product-status" className="label-field">Status</label>
                <select
                  id="admin-product-status"
                  value={productStatus}
                  onChange={(e) => setProductStatus(e.target.value)}
                  data-testid="admin-product-status"
                  className="input-field"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="admin-seller-status" className="label-field">Status</label>
              <select
                id="admin-seller-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                data-testid="admin-seller-status"
                className="input-field"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          )}

          <button type="submit" data-testid="admin-product-apply" className="btn-primary">
            <RefreshCw size={15} /> Apply
          </button>
          {(search || shop || category || productStatus || statusFilter !== 'all') && (
            <button type="button" onClick={resetFilters} data-testid="admin-product-reset" className="btn-secondary">
              Reset
            </button>
          )}
        </div>
      </form>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Skeleton key={item} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : tab === 'appeals' ? (
          appeals.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <Scale size={26} />
              </span>
              <p className="mt-4 font-semibold text-slate-900">No appeals found</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {appealFilter === 'pending' ? 'No pending ban appeals right now.' : 'No appeals match this filter.'}
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {['pending', 'approved', 'rejected', 'all'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAppealFilter(key)}
                    data-testid={`appeal-filter-${key}`}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      appealFilter === key
                        ? 'border-primary bg-primary text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {key[0].toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
              <ul className="space-y-4">
                {appeals.map((appeal) => (
                  <li key={appeal.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet-600">
                            <Scale size={16} />
                          </span>
                          <p className="font-bold text-slate-900">
                            {appeal.targetType === 'shop'
                              ? 'Shop ban appeal'
                              : `Product ban appeal: ${appeal.product?.name || 'unknown product'}`}
                          </p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              appeal.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : appeal.status === 'rejected'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {appeal.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {appeal.seller.storeName || appeal.seller.name} · {appeal.seller.email}
                        </p>
                        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{appeal.reason}</p>
                        {appeal.imageUrl && (
                          <a href={appeal.imageUrl} target="_blank" rel="noreferrer">
                            <img
                              src={appeal.imageUrl}
                              alt="Appeal proof"
                              className="mt-3 h-28 w-44 rounded-xl border border-slate-200 object-cover"
                            />
                          </a>
                        )}
                        {appeal.adminNote && (
                          <p className="mt-2 text-sm text-slate-500">
                            <span className="font-semibold">Admin: </span>
                            {appeal.adminNote}
                          </p>
                        )}
                      </div>
                    </div>
                    {appeal.status === 'pending' && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleAppealReview(appeal, 'approved')}
                          disabled={busyId === appeal.id}
                          data-testid={`approve-appeal-${appeal.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                          {busyId === appeal.id ? <Spinner /> : <ShieldCheck size={14} />}
                          Approve (unban)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAppealReview(appeal, 'rejected')}
                          disabled={busyId === appeal.id}
                          data-testid={`reject-appeal-${appeal.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : tab === 'products' ? (
          products.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <PackageX size={26} />
              </span>
              <p className="mt-4 font-semibold text-slate-900">No products found</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">Try a different search term or filter.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-soft">
              {products.map((product) => (
                <li key={product.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span>{product.category}</span>
                      <span className="text-slate-300">·</span>
                      <span>{product.seller ? `by ${product.seller.name}` : 'Platform product'}</span>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-0.5">
                        <Star size={13} className="text-amber-400" fill="currentColor" />
                        {Number(product.rating).toFixed(1)} ({product.reviewCount})
                      </span>
                      {product.seller?.isBanned && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                          Seller banned
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatPrice(product.price)}</p>
                    <p className="text-sm text-slate-500">{product.stock} in stock</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      product.status === 'banned' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {product.status === 'banned' ? 'Banned' : 'Active'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleProductToggle(product)}
                    disabled={busyId === product.id}
                    data-testid={`toggle-product-${product.id}`}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                      product.status === 'banned'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {busyId === product.id ? (
                      <Spinner />
                    ) : product.status === 'banned' ? (
                      <ShieldCheck size={14} />
                    ) : (
                      <Ban size={14} />
                    )}
                    {product.status === 'banned' ? 'Unban' : 'Ban'}
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : sellers.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Store size={26} />
            </span>
            <p className="mt-4 font-semibold text-slate-900">No shops found</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Try a different search term or filter.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {sellers.map((seller) => (
              <li key={seller.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Store size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{seller.storeName || seller.name}</p>
                    <p className="text-sm text-slate-500">
                      {seller.name} · {seller.email}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">{seller.productCount} products</span>
                      {seller.warningCount > 0 && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
                          {seller.warningCount} warning{seller.warningCount === 1 ? '' : 's'}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 font-semibold ${
                          seller.isBanned ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {seller.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </div>
                    {seller.warnings && seller.warnings.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {seller.warnings.slice(0, 3).map((w) => (
                          <li key={w.id} className="rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-1.5">
                                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-600" />
                                <span className="font-medium text-amber-800">Warning:</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveWarning(w)}
                                disabled={busyId === w.id}
                                data-testid={`remove-warning-${w.id}`}
                                title="Remove this warning"
                                className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
                              >
                                {busyId === w.id ? <Spinner /> : 'Remove'}
                              </button>
                            </div>
                            <p className="mt-1 text-xs text-amber-900">{w.message}</p>
                            {w.replies && w.replies.length > 0 && (
                              <ul className="ml-3 mt-1 space-y-1 border-l border-amber-200 pl-3">
                                {w.replies.map((reply) => (
                                  <li key={reply.id} className="text-xs text-amber-800">
                                    <span className="font-semibold">Seller reply:</span> {reply.message}
                                    {reply.imageUrl && (
                                      <a
                                        href={reply.imageUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="ml-1 inline-flex items-center gap-1 font-semibold text-amber-600 underline underline-offset-2 hover:text-amber-800"
                                      >
                                        view proof
                                      </a>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWarnSellerId(seller.id);
                        setWarnMessage('');
                        setApiError('');
                      }}
                      disabled={busyId === seller.id}
                      data-testid={`warn-${seller.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
                    >
                      <AlertTriangle size={14} /> Warn
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSellerToggle(seller)}
                      disabled={busyId === seller.id}
                      data-testid={`toggle-seller-${seller.id}`}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        seller.isBanned
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {busyId === seller.id ? (
                        <Spinner />
                      ) : seller.isBanned ? (
                        <ShieldCheck size={14} />
                      ) : (
                        <Ban size={14} />
                      )}
                      {seller.isBanned ? 'Unban shop' : 'Ban shop'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {warnSellerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={handleWarn} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Send a warning</h2>
              <button
                type="button"
                onClick={() => setWarnSellerId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              The seller will see this warning on their dashboard.
            </p>
            <textarea
              value={warnMessage}
              onChange={(e) => setWarnMessage(e.target.value)}
              rows={4}
              placeholder="Explain the issue and what they need to fix..."
              data-testid="warn-message"
              className="input-field mt-4 resize-none"
              required
              minLength={5}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setWarnSellerId(null)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={busyId === warnSellerId} className="btn-primary">
                {busyId === warnSellerId ? <Spinner label="Sending..." /> : 'Send warning'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;