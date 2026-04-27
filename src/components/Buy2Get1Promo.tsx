import { Gift, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PromoProductType = 'Master Box' | 'Tester';

export const BUY_2_GET_1_PROMOS: Record<PromoProductType, { label: string; shortLabel: string; note: string }> = {
  'Master Box': {
    label: 'Master Boxes',
    shortLabel: 'Master Box',
    note: 'Lowest-priced Master Box is free at checkout.',
  },
  Tester: {
    label: 'Testers',
    shortLabel: 'Tester',
    note: 'Lowest-priced Tester is free at checkout.',
  },
};

function PromoBurst({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[repeating-conic-gradient(from_0deg,rgba(255,255,255,0.22)_0deg,rgba(255,255,255,0.22)_7deg,transparent_7deg,transparent_17deg)] opacity-25 animate-spin [animation-duration:18s]" />
      <div className="absolute -left-20 top-0 h-full w-52 -skew-x-12 bg-white/15 blur-xl" />
      <div className="absolute -right-20 bottom-0 h-full w-52 -skew-x-12 bg-lime-200/20 blur-xl" />
    </div>
  );
}

export function PromoStrip() {
  return (
    <div className="relative overflow-hidden border-y border-lime-300/30 bg-gradient-to-r from-[#2d7f00] via-[#65c900] to-[#2b7d00] shadow-[0_0_40px_rgba(101,201,0,0.22)]">
      <PromoBurst />
      <div className="container relative z-10 mx-auto flex flex-col items-center justify-center gap-3 px-4 py-4 text-center sm:flex-row sm:gap-8">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 fill-white text-white" />
          <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-white/85">Limited Deal</span>
        </div>
        <p className="font-sans text-3xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.22)] md:text-5xl">
          Buy 2 Get 1
        </p>
        <div className="rounded-full bg-white px-4 py-1.5 font-sans text-xs font-black uppercase tracking-[0.18em] text-[#2f8f00] shadow-xl">
          Free
        </div>
        <p className="max-w-sm font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
          Master Boxes or Testers - same type only - lowest price free
        </p>
      </div>
    </div>
  );
}

function PromoDealCard({ type, active = false }: { type: PromoProductType; active?: boolean }) {
  const promo = BUY_2_GET_1_PROMOS[type];

  return (
    <div
      className={cn(
        'group relative overflow-hidden border p-5 shadow-[0_18px_55px_rgba(72,180,0,0.16)] transition-all duration-300',
        'bg-gradient-to-br from-[#256b00] via-[#58bb00] to-[#153d00]',
        active ? 'scale-[1.01] border-white/60 shadow-[0_22px_70px_rgba(101,201,0,0.34)]' : 'border-lime-300/30 hover:-translate-y-1 hover:border-white/50'
      )}
    >
      <PromoBurst className="opacity-80" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#329600] shadow-xl">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-white/75">{promo.label} Offer</p>
            <p className="mt-1 font-sans text-3xl font-black uppercase leading-none text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.22)] md:text-4xl">
              Buy 2 Get 1
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-sans text-sm font-black uppercase tracking-[0.18em] text-[#2f8f00] shadow-xl">
            <Sparkles className="h-4 w-4 fill-[#2f8f00]" />
            Free
          </div>
          <p className="mt-3 max-w-xs font-sans text-[11px] font-semibold uppercase tracking-[0.13em] text-white/80">{promo.note}</p>
        </div>
      </div>
    </div>
  );
}

export function PromoDealShowcase({ activeType }: { activeType?: PromoProductType | null }) {
  if (activeType) {
    return (
      <div className="mb-8">
        <PromoDealCard type={activeType} active />
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <PromoDealCard type="Master Box" />
      <PromoDealCard type="Tester" />
    </div>
  );
}
