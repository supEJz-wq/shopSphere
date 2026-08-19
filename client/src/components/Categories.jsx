import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categoryImages = {
  Laptop: '/products/category-laptops.svg',
  Smartphone: '/products/category-phones.svg',
  Headphones: '/products/category-headphones.svg',
  Accessories: '/products/category-accessories.svg',
};

const categoryAccents = {
  Laptop: 'from-blue-500 to-indigo-700',
  Smartphone: 'from-violet-500 to-purple-700',
  Headphones: 'from-emerald-500 to-teal-700',
  Accessories: 'from-amber-500 to-orange-700',
};

function Categories({ categories = [] }) {
  return (
    <section data-testid="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Shop by Category</h2>
          <p className="mt-2 text-slate-500">Find exactly what you&apos;re looking for.</p>
        </div>
        <Link
          to="/products"
          className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex"
        >
          View all <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={`/products?category=${encodeURIComponent(category.name)}`}
            data-testid={`category-${category.name.toLowerCase()}`}
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={categoryImages[category.name]}
                alt={category.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-slate-900/70 to-transparent p-5">
              <h3 className="text-lg font-bold text-white">{category.name}</h3>
              <p className="text-sm text-white/80">{category.count} products</p>
            </div>
            <span
              className={`absolute left-3 top-3 rounded-full bg-gradient-to-r ${categoryAccents[category.name]} px-3 py-1 text-xs font-semibold text-white`}
            >
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Categories;
