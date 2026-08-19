import { Truck, ShieldCheck, Headphones, RefreshCcw } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Fast, Free Shipping',
    description: 'Free standard shipping on every order over ₱50. Delivered in 2–4 business days.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Shopping',
    description: 'Your data is always protected with enterprise-grade encryption and safe checkout.',
  },
  {
    icon: RefreshCcw,
    title: 'Easy 30-Day Returns',
    description: "Changed your mind? Return any product within 30 days for a full refund.",
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our friendly support team is here around the clock to answer every question.',
  },
];

function WhyChooseUs() {
  return (
    <section data-testid="why-choose-us" className="border-y border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Why choose ShopSphere?</h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-500">
            We obsess over the details so you can shop with total confidence.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-100 bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-soft"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <feature.icon size={24} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
