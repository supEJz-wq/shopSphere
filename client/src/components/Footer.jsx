import { Link } from 'react-router-dom';
import { ShoppingBag, Github, Twitter, Mail } from 'lucide-react';
import logo from '../assets/logo.png';

function Footer() {
  return (
    <footer data-testid="footer" className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
              <img src={logo} alt="ShopSphere logo" className="h-8 w-8 rounded-lg object-contain" />
              Shop<span className="text-primary">Sphere</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              A modern e-commerce experience for laptops, smartphones, headphones and
              accessories. Built for learning QA automation, API testing and CI/CD.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Shop</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li><Link to="/products" className="transition-colors hover:text-primary">All Products</Link></li>
              <li><Link to="/products?category=Laptop" className="transition-colors hover:text-primary">Laptops</Link></li>
              <li><Link to="/products?category=Smartphone" className="transition-colors hover:text-primary">Smartphones</Link></li>
              <li><Link to="/products?category=Headphones" className="transition-colors hover:text-primary">Headphones</Link></li>
              <li><Link to="/products?category=Accessories" className="transition-colors hover:text-primary">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li><Link to="/" className="transition-colors hover:text-primary">Home</Link></li>
              <li><Link to="/cart" className="transition-colors hover:text-primary">Cart</Link></li>
              <li><Link to="/login" className="transition-colors hover:text-primary">Login</Link></li>
              <li><Link to="/register" className="transition-colors hover:text-primary">Register</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="mailto:hello@shopsphere.com"
              aria-label="Email us"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:text-primary"
            >
              <Mail size={18} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:text-primary"
            >
              <Github size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:text-primary"
            >
              <Twitter size={18} />
            </a>
            <span className="ml-1 flex items-center gap-1.5 text-sm text-slate-400">
              <ShoppingBag size={16} /> V1
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
