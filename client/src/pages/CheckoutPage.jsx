import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { orderService } from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';
import { asianCountries } from '../utils/countries';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 5.99;

const initialAddress = {
  fullName: '',
  street: '',
  city: '',
  postalCode: '',
  country: '',
};

function CheckoutPage() {
  const checked = useRequireAuth();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, loading, error, clearCart } = useCart();

  const [address, setAddress] = useState(() => ({
    ...initialAddress,
    fullName: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    country: 'Philippines',
  }));
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [apiError, setApiError] = useState('');

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!address.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!address.street.trim()) nextErrors.street = 'Street address is required.';
    if (!address.city.trim()) nextErrors.city = 'City is required.';
    if (!address.postalCode.trim()) nextErrors.postalCode = 'Postal code is required.';
    if (!address.country.trim()) nextErrors.country = 'Country is required.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    setApiError('');

    if (Object.keys(nextErrors).length > 0) return;

    setPlacing(true);
    try {
      const data = await orderService.checkout(address);
      clearCart();
      navigate(`/orders/${data.order.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (!checked) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        data-testid="empty-cart-checkout"
        className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center"
      >
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-slate-100 text-slate-400">
          <ShoppingBag size={36} />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Nothing to check out</h1>
        <p className="mt-2 text-slate-500">
          Your cart is empty. Add some products before checking out.
        </p>
        <Link to="/products" data-testid="continue-shopping" className="btn-primary mt-8">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">Enter your shipping details to place the order.</p>

      <div className="mt-8">
        {error && <Alert type="error" message={error} />}
        {apiError && <Alert type="error" message={apiError} />}
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <CreditCard size={16} />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Shipping details</h2>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="checkout-fullname" className="label-field">Full name</label>
              <input
                id="checkout-fullname"
                type="text"
                name="fullName"
                value={address.fullName}
                readOnly
                autoComplete="name"
                placeholder="Jane Doe"
                data-testid="checkout-fullname"
                className="input-field cursor-not-allowed bg-slate-100 text-slate-600"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="checkout-street" className="label-field">Street address</label>
              <input
                id="checkout-street"
                type="text"
                name="street"
                value={address.street}
                onChange={handleChange}
                autoComplete="street-address"
                placeholder="123 Main Street"
                data-testid="checkout-street"
                className="input-field"
              />
              {errors.street && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.street}</p>
              )}
            </div>

            <div>
              <label htmlFor="checkout-city" className="label-field">City</label>
              <input
                id="checkout-city"
                type="text"
                name="city"
                value={address.city}
                onChange={handleChange}
                autoComplete="address-level2"
                placeholder="Quezon City"
                data-testid="checkout-city"
                className="input-field"
              />
              {errors.city && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="checkout-postal" className="label-field">Postal code</label>
              <input
                id="checkout-postal"
                type="text"
                name="postalCode"
                value={address.postalCode}
                onChange={handleChange}
                autoComplete="postal-code"
                placeholder="10001"
                data-testid="checkout-postal"
                className="input-field"
              />
              {errors.postalCode && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.postalCode}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="checkout-country" className="label-field">Country</label>
              <select
                id="checkout-country"
                name="country"
                value={address.country}
                onChange={handleChange}
                autoComplete="country-name"
                data-testid="checkout-country"
                className="input-field"
              >
                <option value="Philippines">Philippines</option>
                {asianCountries
                  .filter((country) => country.name !== 'Philippines')
                  .map((country) => (
                    <option key={country.code} value={country.name} disabled>
                      {country.name} (coming soon)
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs font-medium text-blue-600">
                Shipping currently available in the Philippines. Other Asian countries are coming
                soon.
              </p>
              {errors.country && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.country}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
            <Lock size={14} className="mt-0.5 shrink-0" />
            <span>This is a demo checkout. No payment is processed and no card is required.</span>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-soft lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>

          <ul data-testid="checkout-items" className="mt-4 space-y-4">
            {items.map((item) => (
              <li key={item.id} data-testid="checkout-item" className="flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} × {formatPrice(item.product.price)}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {formatPrice(item.total)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <dt>Subtotal ({items.length} items)</dt>
              <dd className="font-semibold text-slate-900">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <dt>Shipping</dt>
              <dd className={shipping === 0 ? 'font-semibold text-emerald-600' : 'font-medium'}>
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd data-testid="checkout-total" className="text-xl font-bold text-slate-900">
                {formatPrice(total)}
              </dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={placing}
            data-testid="place-order"
            className="btn-primary mt-6 w-full"
          >
            {placing ? <Spinner label="Placing order..." /> : 'Place Order'}
          </button>

          <Link to="/cart" data-testid="back-to-cart" className="btn-secondary mt-3 w-full">
            Back to cart
          </Link>
        </aside>
      </form>
    </div>
  );
}

export default CheckoutPage;