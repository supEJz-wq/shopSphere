import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <div className="relative">
        <span className="bg-gradient-to-br from-primary to-blue-900 bg-clip-text text-9xl font-black text-transparent">
          404
        </span>
        <span className="absolute -right-4 top-2 grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
          <Compass size={24} />
        </span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you
        back on track.
      </p>
      <Link to="/" data-testid="return-home" className="btn-primary mt-8">
        <Home size={16} /> Return Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
