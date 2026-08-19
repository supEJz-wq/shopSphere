import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { CheckCircle2, PackageX, MapPin, ArrowRight, Receipt as ReceiptIcon } from 'lucide-react';
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
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrderReceiptPage() {
  const checked = useRequireAuth();
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const justPlaced = Boolean(location.state?.justPlaced);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data.order);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('not-found');
        } else {
          setError(err.response?.data?.message || 'Could not load this order.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (!checked) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error === 'not-found') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-slate-100 text-slate-400">
          <PackageX size={36} />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Order not found</h1>
        <p className="mt-2 text-slate-500">
          The order you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link to="/orders" data-testid="back-to-orders" className="btn-primary mt-8">
          View your orders
        </Link>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert type="error" message={error || 'Something went wrong.'} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {justPlaced && (
        <div
          data-testid="order-success-banner"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700"
        >
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Order placed successfully!</p>
            <p className="text-emerald-600">A confirmation receipt is shown below.</p>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <ReceiptIcon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Order receipt</p>
                <p data-testid="order-id" className="text-xs text-slate-500">
                  #{order.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p data-testid="order-date" className="text-sm font-semibold text-slate-900">
                {formatDate(order.createdAt)}
              </p>
              <p className="text-xs text-slate-500">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Items</h2>
          <ul data-testid="receipt-items" className="mt-3 divide-y divide-slate-100">
            {order.items.map((item) => (
              <li key={item.id} data-testid="receipt-item" className="flex items-center gap-4 py-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{item.product.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="font-bold text-slate-900">{formatPrice(item.total)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <p className="font-semibold text-slate-900">Shipping to</p>
              <p className="mt-0.5">{order.shippingAddress.fullName}</p>
              <p>
                {order.shippingAddress.street}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
            </div>
          </div>
        </div>

        <dl className="border-t border-slate-100 px-6 py-5 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <dt>Subtotal</dt>
            <dd className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="mt-2 flex items-center justify-between text-slate-600">
            <dt>Shipping</dt>
            <dd className="font-semibold text-slate-900">
              {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
            </dd>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-base">
            <dt className="font-bold text-slate-900">Total</dt>
            <dd data-testid="order-total" className="text-xl font-extrabold text-slate-900">
              {formatPrice(order.total)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/orders"
          data-testid="view-orders"
          className="btn-secondary flex-1"
        >
          View all orders <ArrowRight size={16} />
        </Link>
        <Link to="/products" data-testid="continue-shopping" className="btn-primary flex-1">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderReceiptPage;