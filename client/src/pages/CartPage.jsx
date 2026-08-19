import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { formatPrice } from '../utils/formatPrice';
import QuantitySelector from '../components/QuantitySelector';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';

function CartPage() {
  const checked = useRequireAuth();
  const { items, subtotal, loading, error, updateQuantity, removeItem } = useCart();

  if (!checked) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-40 rounded-lg" />
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Cart</h1>

      <div className="mt-8">
        {error && <Alert type="error" message={error} />}
      </div>

      {items.length === 0 ? (
        <div
          data-testid="empty-cart"
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center"
        >
          <span className="grid h-20 w-20 place-items-center rounded-3xl bg-slate-100 text-slate-400">
            <ShoppingBag size={36} />
          </span>
          <h2 className="mt-6 text-xl font-semibold text-slate-900">Your cart is empty</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Looks like you haven&apos;t added anything yet. Explore our catalog and find
            something you love.
          </p>
          <Link to="/products" data-testid="continue-shopping" className="btn-primary mt-8">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                data-testid="cart-item"
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:flex-row sm:items-center"
              >
                <Link to={`/products/${item.product.id}`} className="shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    data-testid="cart-item-image"
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col gap-1">
                  <Link
                    to={`/products/${item.product.id}`}
                    data-testid="cart-item-name"
                    className="font-semibold text-slate-900 hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  <p data-testid="cart-item-price" className="text-sm text-slate-500">
                    {formatPrice(item.product.price)} each
                  </p>
                </div>

                <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <QuantitySelector
                    value={item.quantity}
                    onChange={(next) => updateQuantity(item.id, next)}
                    min={1}
                    max={item.product.stock}
                  />
                  <p data-testid="cart-item-total" className="font-bold text-slate-900">
                    {formatPrice(item.total)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  data-testid="remove-item"
                  aria-label={`Remove ${item.product.name} from cart`}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-soft lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <dt>Subtotal ({items.length} items)</dt>
                <dd data-testid="cart-total" className="text-lg font-bold text-slate-900">
                  {formatPrice(subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <dt>Shipping</dt>
                <dd className={subtotal >= 50 ? 'font-semibold text-emerald-600' : 'font-medium'}>
                  {subtotal >= 50 ? 'Free' : formatPrice(5.99)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/checkout"
                data-testid="proceed-to-checkout"
                className="btn-primary w-full"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <Link
                to="/products"
                data-testid="continue-shopping"
                className="btn-secondary w-full"
              >
                Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default CartPage;
