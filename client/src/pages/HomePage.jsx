import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import WhyChooseUs from '../components/WhyChooseUs';
import Newsletter from '../components/Newsletter';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';

const FEATURED_COUNT = 4;

function HomePage() {
  const { products, loading, error } = useProducts();

  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return Object.keys(counts).map((name) => ({ name, count: counts[name] }));
  }, [products]);

  const featured = products.slice(0, FEATURED_COUNT);

  return (
    <>
      <Hero />
      <Categories categories={categoryCounts} />

      <section data-testid="featured-products" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Featured Products</h2>
            <p className="mt-2 text-slate-500">Hand-picked favourites our customers love.</p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8">
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : error ? (
            <Alert type="error" message={error} />
          ) : featured.length === 0 ? (
            <div
              data-testid="empty-product-list"
              className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center"
            >
              <p className="text-lg font-semibold text-slate-700">No products available yet.</p>
              <p className="mt-1 text-sm text-slate-500">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <WhyChooseUs />
      <Newsletter />
    </>
  );
}

export default HomePage;
