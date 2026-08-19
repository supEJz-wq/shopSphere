import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Eye, EyeOff, ShieldCheck, Store, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@shopsphere.com', password: 'password123', icon: ShieldCheck },
  { role: 'Seller', email: 'seller@shopsphere.com', password: 'password123', icon: Store },
  { role: 'Customer', email: 'demo@shopsphere.com', password: 'password123', icon: User },
];

function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Please enter a valid email address.';
    if (!form.password) nextErrors.password = 'Password is required.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setApiError('');

    if (Object.keys(nextErrors).length > 0) return;

    try {
      const data = await login(form);
      if (data.user?.role === 'admin') {
        navigate('/admin/applications', { replace: true });
        return;
      }
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not log in. Please try again.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-soft">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <LogIn size={24} />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to your ShopSphere account.</p>
        </div>

        <div className="mt-6 space-y-4">
          <Alert type="error" message={apiError} />

          <form onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="login-email" className="label-field">Email address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="jane@example.com"
                data-testid="login-email"
                className="input-field"
              />
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="login-password" className="label-field">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="Your password"
                  data-testid="login-password"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="login-button"
              className="btn-primary mt-6 w-full"
            >
              {loading ? <Spinner label="Logging in..." /> : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Demo accounts — try it out
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Password for all accounts: <span className="font-mono font-medium">password123</span>
          </p>
          <ul className="mt-3 space-y-2">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              return (
                <li
                  key={account.role}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900">
                        {account.role}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{account.email}</span>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ email: account.email, password: account.password });
                      setErrors({});
                      setApiError('');
                    }}
                    data-testid={`use-demo-${account.role.toLowerCase()}`}
                    className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    Use this account
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
