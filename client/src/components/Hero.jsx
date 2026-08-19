import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, ShieldCheck, Headphones } from 'lucide-react';

function Hero() {
  return (
    <section data-testid="hero" className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-surface to-emerald-50">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="animate-fadeIn">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles size={14} /> New Season Collection
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Everything you need.
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nothing you don&apos;t.
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
            Discover premium laptops, smartphones, headphones and accessories —
            curated for the way you live, work and play.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/products" data-testid="shop-now-button" className="btn-primary">
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link to="/products" className="btn-secondary">
              Browse Products
            </Link>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-slate-900">12+</p>
              <p className="text-sm text-slate-500">Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">4.6★</p>
              <p className="text-sm text-slate-500">Avg rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">24/7</p>
              <p className="text-sm text-slate-500">Support</p>
            </div>
          </div>
        </div>

        <div className="relative animate-fadeIn" style={{ animationDelay: '120ms' }}>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-900 shadow-lift">
            <img
              src="/products/hero-collection.svg"
              alt="Featured ShopSphere products"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-white p-4 shadow-lift sm:block">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <ShieldCheck size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Free Returns</p>
                <p className="text-xs text-slate-500">30-day guarantee</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 hidden rounded-2xl bg-white p-4 shadow-lift sm:block">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Truck size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Fast Shipping</p>
                <p className="text-xs text-slate-500">Free over ₱50</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
