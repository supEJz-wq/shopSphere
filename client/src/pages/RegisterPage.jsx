import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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

    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required.';
    else if (form.firstName.trim().length < 2) nextErrors.firstName = 'First name must be at least 2 characters.';

    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required.';
    else if (form.lastName.trim().length < 2) nextErrors.lastName = 'Last name must be at least 2 characters.';

    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Please enter a valid email address.';

    if (!form.password) nextErrors.password = 'Password is required.';
    else if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';

    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setApiError('');

    if (Object.keys(nextErrors).length > 0) return;

    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not create your account. Please try again.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-soft">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <UserPlus size={24} />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Join ShopSphere and start shopping today.</p>
        </div>

        <div className="mt-6 space-y-4">
          <Alert type="error" message={apiError} />

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="register-firstname" className="label-field">First name</label>
                <input
                  id="register-firstname"
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                  placeholder="Jane"
                  data-testid="register-firstname"
                  className="input-field"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs font-medium text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="register-lastname" className="label-field">Last name</label>
                <input
                  id="register-lastname"
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  placeholder="Doe"
                  data-testid="register-lastname"
                  className="input-field"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs font-medium text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="register-email" className="label-field">Email address</label>
              <input
                id="register-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="jane@example.com"
                data-testid="register-email"
                className="input-field"
              />
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="register-password" className="label-field">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  data-testid="register-password"
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

            <div className="mt-4">
              <label htmlFor="register-confirm-password" className="label-field">Confirm password</label>
              <input
                id="register-confirm-password"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                data-testid="register-confirm-password"
                className="input-field"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="register-button"
              className="btn-primary mt-6 w-full"
            >
              {loading ? <Spinner label="Creating account..." /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
