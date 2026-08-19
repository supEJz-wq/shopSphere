import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReceiptText, PackageX, ArrowRight } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { formatPrice } from '../utils/formatPrice';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function OrderHistoryPage() {
  const checked = useRequireAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!checked) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await orderService.getOrders();
        setOrders(data.orders);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [checked]);

  if (!checked) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-60 rounded-lg" />
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Order History</h1>
      <p className="mt-1 text-sm text-slate-500">A record of everything you&apos;ve purchased.</p>

      <div className="mt-6">
        {error && <Alert type="error" message={error} />}
      </div>

      {orders.length === 0 ? (
        <div
          data-testid="empty-order-history"
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center"
        >
          <span className="grid h-20 w-20 place-items-center rounded-3xl bg-slate-100 text-slate-400">
            <PackageX size={36} />
          </span>
          <h2 className="mt-6 text-xl font-semibold text-slate-900">No orders yet</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            When you place your first order, the receipt will be saved here so you can review it
            anytime.
          </p>
          <Link to="/products" data-testid="continue-shopping" className="btn-primary mt-8">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <ul data-testid="order-history" className="mt-8 space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li
                key={order.id}
                data-testid="order-card"
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <ReceiptText size={20} />
                  </span>
                  <div className="min-w-0">
                    <p data-testid="order-number" className="font-semibold text-slate-900">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(order.createdAt)} · {itemCount} item{itemCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p
                    data-testid="order-total"
                    className="text-lg font-bold text-slate-900"
                  >
                    {formatPrice(order.total)}
                  </p>
                  <Link
                    to={`/orders/${order.id}`}
                    data-testid="view-order-receipt"
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    View receipt
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default OrderHistoryPage;