import { useState } from 'react';
import { Send, CheckCircle2, Mail } from 'lucide-react';
import Alert from './ui/Alert';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: null, message: '' });

  const handleSubmit = (event) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }
    if (!emailRegex.test(email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setStatus({ type: 'success', message: 'Thanks for subscribing! Stay tuned for great deals.' });
    setEmail('');
  };

  return (
    <section data-testid="newsletter" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-900 px-6 py-12 shadow-lift sm:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-white">
            <Mail size={22} />
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
            Stay in the loop
          </h2>
          <p className="mt-2 text-blue-100">
            Subscribe to our newsletter and be the first to know about new arrivals and exclusive offers.
          </p>

          <form onSubmit={handleSubmit} className="mt-6" noValidate>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                data-testid="newsletter-input"
                className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                data-testid="newsletter-submit"
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-blue-50"
              >
                Subscribe <Send size={16} />
              </button>
            </div>
            <div className="mt-4 text-left">
              <Alert type={status.type} message={status.message} />
              {status.type === 'success' && (
                <p className="flex items-center justify-center gap-1.5 text-sm text-emerald-300">
                  <CheckCircle2 size={16} /> Check your inbox!
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
