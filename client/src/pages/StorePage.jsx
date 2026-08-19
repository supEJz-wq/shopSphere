import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Store, Package, Star } from 'lucide-react';
import { storeService } from '../services/storeService';
import { formatPrice } from '../utils/formatPrice';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';

function StorePage() {
  const { id } = useParams();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await storeService.getStore(id);
        setStore(data.store);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('not-found');
        } else {
          setError(err.response?.data?.message || 'Could not load this store.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="mt-6 h-32 w-full rounded-2xl" />
        <Skeleton className="mt-6 h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (error === 'not-found') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-slate-100 text-slate-400">
          <Store size={36} />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Store not found</h1>
        <p className="mt-2 text-slate-500">This store doesn&apos;t exist or is no longer available.</p>
        <Link to="/products" className="btn-primary mt-8">Browse products</Link>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert type="error" message={error || 'Something went wrong.'} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
        <div className="bg-gradient-to-r from-primary/15 to-accent/10 px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-primary shadow-soft">
              <Store size={26} />
            </span>
            <div className="min-w-0">
              <h1 data-testid="store-name" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {store.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Star size={15} className="text-amber-400" fill="currentColor" />
                  {store.rating > 0 ? store.rating.toFixed(1) : 'New'} ({store.reviewCount}{' '}
                  {store.reviewCount === 1 ? 'rating' : 'ratings'})
                </span>
                <span className="flex items-center gap-1">
                  <Package size={14} /> {store.productCount} products
                </span>
              </div>
            </div>
          </div>
          {store.description && (
            <p className="mt-4 text-sm leading-relaxed text-slate-700">{store.description}</p>
          )}
        </div>

        {store.productNames.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              From this store
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {store.productNames.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 p-2 pr-4 transition hover:border-primary"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-primary">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StorePage;