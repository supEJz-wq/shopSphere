import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, PackageX } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';

function ProductsPage() {
  const { products, loading, error } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');

  const categories = useMemo(() => {
    const set = new Set(products.map((product) => product.category));
    return ['All', ...set];
  }, [products]);

  const changeCategory = (next) => {
    setCategory(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'All') {
      params.delete('category');
    } else {
      params.set('category', next);
    }
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    setCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = category === 'All' || product.category === category;
      return matchesSearch && matchesCategory;
    });

    if (sort === 'low-to-high') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === 'high-to-low') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, search, sort, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
        <p className="text-slate-500">Explore our full catalog of tech essentials.</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            data-testid="search-input"
            className="input-field pl-11"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <SlidersHorizontal size={16} /> Sort by
          </span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort products"
            data-testid="sort-select"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="featured">Featured</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div data-testid="category-filter" className="mt-6 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => changeCategory(item)}
            data-testid={`category-${item.toLowerCase().replace(/\s+/g, '-')}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === item
                ? 'bg-primary text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <Alert type="error" message={error} />
        ) : filtered.length === 0 ? (
          <div
            data-testid="empty-product-list"
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center"
          >
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <PackageX size={28} />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No products found</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              We couldn&apos;t find any products matching your search. Try a different term or
              clear your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                changeCategory('All');
                setSort('featured');
              }}
              className="btn-secondary mt-6"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            data-testid="product-grid"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
