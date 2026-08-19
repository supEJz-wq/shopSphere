import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, Ban, RefreshCw, PackageX, Wallet, CalendarDays, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { sellerService } from '../services/sellerService';
import { formatPrice } from '../utils/formatPrice';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const TABS = [
  { key: 'all', label: 'All', icon: Package },
  { key: 'processing', label: 'To Ship', icon: RefreshCw },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'cancelled', label: 'Cancelled', icon: Ban },
];

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

function SellerOrdersPage() {
  const checked = useRequireAuth();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sellerService.getOrders();
      setOrders(data.orders);
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response?.data?.message || 'Your shop has been banned. Contact support for assistance.');
        return;
      }
      setError(err.response?.data?.message || 'Could not load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checked) return;
    const init = async () => {
      try {
        const freshUser = await refreshUser();
        if (freshUser.role !== 'seller') {
          navigate('/seller/apply', { replace: true });
          return;
        }
        if (freshUser.isBanned) {
          setError('Your shop has been banned. Contact support for assistance.');
          setLoading(false);
          return;
        }
      } catch {
        /* handled by useRequireAuth */
      }
      fetchOrders();
    };
    init();
  }, [checked]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!checked) return null;

  const handleStatusChange = async (orderItemId, status) => {
    setUpdatingId(orderItemId);
    setApiError('');
    setSuccessMessage('');
    try {
      await sellerService.updateOrderItemStatus(orderItemId, status);
      setSuccessMessage(status === 'shipped' ? 'Order item marked as shipped.' : 'Order item cancelled.');
      await fetchOrders();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not update the order item.');
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleOrders = orders.filter((order) =>
    activeTab === 'all' ? true : order.items.some((item) => item.status === activeTab)
  );

  const tabsWithCounts = TABS.map((tab) => ({
    ...tab,
    count:
      tab.key === 'all'
        ? orders.length
        : orders.reduce((sum, order) => sum + order.items.filter((item) => item.status === tab.key).length, 0),
  }));

  const allOrderItems = orders.flatMap((order) => order.items);
  const totalSales = allOrderItems
    .filter((item) => item.status !== 'cancelled')
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalUnitsSold = allOrderItems
    .filter((item) => item.status !== 'cancelled')
    .reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = allOrderItems.length;
  const earliestDate = orders.length > 0 ? new Date(Math.min(...orders.map((o) => new Date(o.createdAt)))) : null;
  const latestDate = orders.length > 0 ? new Date(Math.max(...orders.map((o) => new Date(o.createdAt)))) : null;

  const formatDate = (date) =>
    date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const stats = [
    { label: 'Total Sales', value: formatPrice(totalSales), icon: Wallet, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Orders', value: String(orders.length), icon: ClipboardList, color: 'bg-blue-50 text-blue-600' },
    { label: 'Units Sold', value: String(totalUnitsSold), icon: Package, color: 'bg-violet-50 text-violet-600' },
    { label: 'Items (all time)', value: String(totalItems), icon: PackageX, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <Package size={24} />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Seller Orders</h1>
          <p className="text-sm text-slate-500">Manage orders for your products — ship or cancel them.</p>
        </div>
      </div>

      <div className="mt-6">
        {successMessage && <Alert type="success" message={successMessage} />}
        {apiError && <Alert type="error" message={apiError} />}
        {error && <Alert type="error" message={error} />}
      </div>

      {!loading && orders.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${stat.color}`}>
                    <Icon size={20} />
                  </span>
                  <p className="mt-3 text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {earliestDate && latestDate && (
            <p className="mt-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              <CalendarDays size={15} />
              Sales activity from {formatDate(earliestDate)} to {formatDate(latestDate)}
            </p>
          )}
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {tabsWithCounts.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              data-testid={`tab-${tab.key}`}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon size={15} />
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <PackageX size={26} />
            </span>
            <p className="mt-4 font-semibold text-slate-900">No orders here</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {activeTab === 'all'
                ? 'Orders containing your products will appear here.'
                : `No ${statusLabel[activeTab].toLowerCase()} orders right now.`}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {visibleOrders.map((order) => {
              const orderTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
              const orderUnitCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <li key={order.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-slate-500">
                        {order.customer.name} · {order.customer.email}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[order.status] || 'bg-slate-100 text-slate-600'}`}
                      >
                        {order.status}
                      </span>
                      <p className="mt-2 text-sm text-slate-500">
                        {orderUnitCount} item{orderUnitCount === 1 ? '' : 's'} · Your total
                      </p>
                      <p className="text-xl font-bold text-slate-900">{formatPrice(orderTotal)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                      <p className="font-semibold text-slate-700">Ship to</p>
                      <p className="mt-1">
                        {order.shippingAddress.fullName}
                        <br />
                        {order.shippingAddress.street}, {order.shippingAddress.city}{' '}
                        {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                      <p className="font-semibold text-slate-700">Summary</p>
                      <div className="mt-1 space-y-0.5">
                        <p>
                          Ordered on{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-PH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p>
                          Product total: <span className="font-semibold text-slate-700">{formatPrice(orderTotal)}</span>
                        </p>
                        <p>
                          Items: <span className="font-semibold text-slate-700">{orderUnitCount} unit{orderUnitCount === 1 ? '' : 's'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <ul className="mt-4 divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex flex-wrap items-center gap-4 py-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">{item.product.name}</p>
                          <p className="text-sm text-slate-500">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[item.status] || 'bg-slate-100 text-slate-600'}`}
                          >
                            {statusLabel[item.status] || item.status}
                          </span>
                          <p className="mt-1 font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                        {item.status === 'processing' && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item.id, 'shipped')}
                              disabled={updatingId === item.id}
                              data-testid={`ship-${item.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                              {updatingId === item.id ? <Spinner /> : <Truck size={14} />}
                              Ship
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item.id, 'cancelled')}
                              disabled={updatingId === item.id}
                              data-testid={`cancel-${item.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                            >
                              <Ban size={14} />
                              Cancel
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SellerOrdersPage;
