import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogOut, User, ReceiptText, BadgeCheck, Store, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png';

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

const roleConfig = {
  customer: { label: 'Customer', icon: BadgeCheck, className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  seller: { label: 'Seller', icon: Store, className: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' },
  admin: { label: 'Admin', icon: ShieldCheck, className: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100' },
};

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  const role = user?.role || 'customer';
  const badge = roleConfig[role] || roleConfig.customer;
  const BadgeIcon = badge.icon;
  const isSeller = role === 'seller';
  const isAdmin = role === 'admin';
  const canShop = !isSeller && !isAdmin;
  const homePath = isAdmin ? '/admin/applications' : isSeller ? '/seller/dashboard' : '/';
  const homeLabel = isAdmin ? 'Seller Applications' : isSeller ? 'Dashboard' : 'Home';

  return (
    <header
      data-testid="navbar"
      className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur transition-shadow ${
        scrolled ? 'shadow-soft' : 'border-slate-100'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to={homePath}
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900"
            onClick={closeMenu}
          >
            <img src={logo} alt="ShopSphere logo" className="h-8 w-8 rounded-lg object-contain" />
            <span>
              Shop<span className="text-primary">Sphere</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink to={homePath} className={navLinkClass} end>
              {homeLabel}
            </NavLink>
            {!isAdmin && (
              <NavLink to="/products" className={navLinkClass}>
                Products
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/products" className={navLinkClass}>
                Products
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/history" className={navLinkClass}>
                History
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/withdrawals" className={navLinkClass}>
                Withdrawals
              </NavLink>
            )}
            {isSeller && (
              <>
                <NavLink to="/seller/products" className={navLinkClass}>
                  My Products
                </NavLink>
                <NavLink to="/seller/orders" className={navLinkClass}>
                  Orders
                </NavLink>
                <NavLink to="/seller/wallet" className={navLinkClass}>
                  Wallet
                </NavLink>
              </>
            )}
            {isAuthenticated && canShop && (
              <NavLink to="/orders" className={navLinkClass}>
                Orders
              </NavLink>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {canShop && (
            <NavLink
              to="/cart"
              className="relative rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="View cart"
              data-testid="cart-button"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span
                  data-testid="cart-count"
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-white"
                >
                  {itemCount}
                </span>
              )}
            </NavLink>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {canShop && (
                <NavLink
                  to="/orders"
                  data-testid="orders-button"
                  aria-label="View your orders"
                  className="hidden rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:block"
                >
                  <ReceiptText size={20} />
                </NavLink>
              )}
              <span
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 lg:flex"
                data-testid="user-name"
              >
                <User size={16} />
                {user?.firstName}
              </span>
              <Link
                to={isAdmin ? '/admin/applications' : '/seller/dashboard'}
                data-testid="customer-badge"
                title={`You are a ${badge.label}`}
                className={`hidden items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors lg:flex ${badge.className}`}
              >
                <BadgeIcon size={16} />
                {badge.label}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/reports"
                  data-testid="admin-reports-button"
                  className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 lg:flex"
                >
                  Reports
                </Link>
              )}
              {!isSeller && !isAdmin && (
                <Link
                  to="/seller/apply"
                  data-testid="become-seller-button"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  Become a Seller
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                data-testid="logout-button"
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <Link
                to="/register"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {canShop && (
            <NavLink
              to="/cart"
              className="relative rounded-xl p-2.5 text-slate-600"
              aria-label="View cart"
              data-testid="cart-button"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span
                  data-testid="cart-count"
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-white"
                >
                  {itemCount}
                </span>
              )}
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="rounded-xl p-2.5 text-slate-600"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to={homePath} className={navLinkClass} end onClick={closeMenu}>
              {homeLabel}
            </NavLink>
            {!isAdmin && (
              <NavLink to="/products" className={navLinkClass} onClick={closeMenu}>
                Products
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/products" className={navLinkClass} onClick={closeMenu}>
                Products
              </NavLink>
            )}
            {isSeller && (
              <>
                <NavLink to="/seller/products" className={navLinkClass} onClick={closeMenu}>
                  My Products
                </NavLink>
                <NavLink to="/seller/orders" className={navLinkClass} onClick={closeMenu}>
                  Orders
                </NavLink>
                <NavLink to="/seller/wallet" className={navLinkClass} onClick={closeMenu}>
                  Wallet
                </NavLink>
              </>
            )}

            {isAuthenticated ? (
              <>
                <span className="px-3 py-2 text-sm font-medium text-slate-500">
                  Signed in as {user?.firstName} {user?.lastName}
                </span>
                <Link
                  to={isAdmin ? '/admin/applications' : '/seller/dashboard'}
                  data-testid="customer-badge"
                  onClick={closeMenu}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${badge.className}`}
                >
                  <BadgeIcon size={16} />
                  {badge.label}
                </Link>
                {!isSeller && !isAdmin && (
                  <NavLink to="/seller/apply" className={navLinkClass} onClick={closeMenu}>
                    Become a Seller
                  </NavLink>
                )}
                {isSeller && (
                  <NavLink to="/seller/dashboard" className={navLinkClass} onClick={closeMenu}>
                    Seller Dashboard
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink to="/admin/applications" className={navLinkClass} onClick={closeMenu}>
                    Review Applications
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink to="/admin/reports" className={navLinkClass} onClick={closeMenu}>
                    Reports
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink to="/admin/history" className={navLinkClass} onClick={closeMenu}>
                    History
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink to="/admin/withdrawals" className={navLinkClass} onClick={closeMenu}>
                    Withdrawals
                  </NavLink>
                )}
                {canShop && (
                  <NavLink to="/orders" className={navLinkClass} onClick={closeMenu}>
                    Orders
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  data-testid="logout-button"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass} onClick={closeMenu}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navLinkClass} onClick={closeMenu}>
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
