import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, ChevronRight, PackageX } from 'lucide-react';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import QuantitySelector from '../components/QuantitySelector';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import ProductReviews from '../components/ProductReviews';
import ReportButton from '../components/ReportModal';

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getById(id);
        setProduct(data.product);
        setActiveImage(0);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('not-found');
        } else {
          setError(err.response?.data?.message || 'Could not load this product.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    setQuantity(1);
    setAdded(false);
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.id}` } });
      return;
    }

    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add item to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-28 rounded-lg" />
            <Skeleton className="h-9 w-3/4 rounded-lg" />
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
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
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Product not found</h1>
        <p className="mt-2 text-slate-500">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link to="/products" data-testid="back-to-products" className="btn-primary mt-8">
          Browse products
        </Link>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert type="error" message={error || 'Something went wrong.'} />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const isStaff = user?.role === 'seller' || user?.role === 'admin';

  const images = (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean);
  const activeImageUrl = images[activeImage] || product.image;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-primary">Products</Link>
        <ChevronRight size={14} />
        <span className="font-medium text-slate-800">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
            <img
              src={activeImageUrl}
              alt={product.name}
              data-testid="product-image"
              className="aspect-square w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((src, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  data-testid={`product-thumb-${index}`}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition-colors ${
                    index === activeImage ? 'border-primary' : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <img src={src} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {product.category}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                outOfStock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {outOfStock ? 'Out of stock' : `In stock (${product.stock})`}
            </span>
            {product.seller?.id && (
              <>
                <Link
                  to={`/stores/${product.seller.id}`}
                  data-testid="store-link"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-primary hover:text-primary"
                >
                  Store: {product.seller.storeName || product.seller.name}
                </Link>
                <ReportButton targetType="product" target={product} label="Report product" />
              </>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill={star <= Math.round(Number(product.rating)) ? 'currentColor' : 'none'}
                />
              ))}
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {Number(product.rating).toFixed(1)} / 5
            </span>
          </div>

          <p data-testid="product-price" className="mt-5 text-4xl font-extrabold text-slate-900">
            {formatPrice(product.price)}
          </p>

          <p data-testid="product-description" className="mt-6 leading-relaxed text-slate-600">
            {product.description}
          </p>

          {isStaff ? (
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
              Seller and admin accounts cannot add items to cart or make purchases.
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">Quantity</span>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={outOfStock ? 0 : product.stock}
                  testidPrefix="product-"
                />
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || outOfStock}
                data-testid="add-to-cart"
                className="btn-primary flex-1 sm:flex-none sm:min-w-52"
              >
                {adding ? (
                  <Spinner label="Adding..." />
                ) : added ? (
                  <>
                    <Check size={18} /> Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart
                  </>
                )}
              </button>
            </div>
          )}

          {error && <div className="mt-4"><Alert type="error" message={error} /></div>}

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 text-center">
            <div>
              <p className="text-sm font-semibold text-slate-900">Free shipping</p>
              <p className="text-xs text-slate-500">On orders ₱50+</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">30-day returns</p>
              <p className="text-xs text-slate-500">No questions asked</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Secure checkout</p>
              <p className="text-xs text-slate-500">Protected by default</p>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}

export default ProductDetailsPage;
