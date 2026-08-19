import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, PackageX } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import ReportButton from './ReportModal';

const categoryColor = {
  Laptop: 'bg-blue-100 text-blue-700',
  Smartphone: 'bg-violet-100 text-violet-700',
  Headphones: 'bg-emerald-100 text-emerald-700',
  Accessories: 'bg-amber-100 text-amber-700',
};

function ProductCard({ product }) {
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;
  const isStaff = user?.role === 'seller' || user?.role === 'admin';

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.id}` } });
      return;
    }

    setAdding(true);
    try {
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      setAdded(false);
    } finally {
      setAdding(false);
    }
  };

  const badgeClass = categoryColor[product.category] || 'bg-slate-100 text-slate-700';

  return (
    <Link
      to={`/products/${product.id}`}
      data-testid="product-card"
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        <img
          src={product.image}
          alt={product.name}
          data-testid="product-image"
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {product.category}
        </span>
        {outOfStock && (
          <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-semibold text-slate-600 backdrop-blur-sm">
            <span className="flex items-center gap-1.5">
              <PackageX size={16} /> Out of stock
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 data-testid="product-name" className="text-base font-semibold text-slate-900">
          {product.name}
        </h3>
        {product.seller?.id && (
          <Link
            to={`/stores/${product.seller.id}`}
            data-testid="store-link"
            className="w-fit text-xs font-medium text-slate-500 transition-colors hover:text-primary"
          >
            by {product.seller.storeName || product.seller.name}
          </Link>
        )}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="flex items-center gap-0.5 text-amber-400">
            <Star size={14} fill="currentColor" />
            <span className="font-semibold text-slate-700">{Number(product.rating).toFixed(1)}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className={outOfStock ? 'font-medium text-red-500' : 'font-medium text-emerald-600'}>
            {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
          </span>
        </div>
        <p data-testid="product-price" className="mt-auto pt-1 text-lg font-bold text-slate-900">
          {formatPrice(product.price)}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <ReportButton targetType="product" target={product} />
        </div>
        {isStaff ? (
          <p
            data-testid="seller-cannot-buy"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-xs font-semibold text-slate-400"
          >
            Seller and admin accounts cannot purchase
          </p>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || outOfStock}
            data-testid="add-to-cart"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {added ? (
              <>
                <Check size={16} className="text-accent" /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> Add to Cart
              </>
            )}
          </button>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;
