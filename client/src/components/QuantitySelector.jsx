import { Minus, Plus } from 'lucide-react';

function QuantitySelector({ value, onChange, min = 1, max = 99, testidPrefix = '' }) {
  const clamp = (next) => Math.min(Math.max(next, min), max);

  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        data-testid={`${testidPrefix}decrease-quantity`}
        className="grid h-11 w-11 place-items-center rounded-l-xl text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const parsed = parseInt(event.target.value, 10);
          onChange(Number.isNaN(parsed) ? min : clamp(parsed));
        }}
        data-testid={`${testidPrefix}quantity-input`}
        aria-label="Quantity"
        className="h-11 w-14 border-x border-slate-200 text-center text-sm font-semibold text-slate-900 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        data-testid={`${testidPrefix}increase-quantity`}
        className="grid h-11 w-11 place-items-center rounded-r-xl text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

export default QuantitySelector;
