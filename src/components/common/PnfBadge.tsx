import React from 'react';
import { PNF } from '../../types/academic';

interface PnfBadgeProps {
  pnf?: PNF;
  size?: 'sm' | 'md' | 'lg';
  showModality?: boolean;
}

export const PnfBadge: React.FC<PnfBadgeProps> = ({ pnf, size = 'md', showModality = true }) => {
  if (!pnf) return null;

  // Exact characteristic color mappings:
  // - Medicina Veterinaria: Verde claro
  // - Nutrición: Gris claro
  // - Informática: Azul
  // - Agroalimentación: Verde y marrón claro (tierra)
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-300';
  let dotColor = 'bg-slate-500';

  if (pnf.code === 'PNF-INF' || pnf.id === 'pnf-info') {
    badgeStyles = 'bg-blue-50 text-blue-800 border-blue-200 ring-1 ring-blue-500/20';
    dotColor = 'bg-blue-600';
  } else if (pnf.code === 'PNF-VET' || pnf.id === 'pnf-vet') {
    badgeStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-500/20';
    dotColor = 'bg-emerald-600';
  } else if (pnf.code === 'PNF-NUT' || pnf.id === 'pnf-nut') {
    badgeStyles = 'bg-slate-100 text-slate-800 border-slate-300 ring-1 ring-slate-400/20';
    dotColor = 'bg-slate-600';
  } else if (pnf.code === 'PNF-AGRO' || pnf.id === 'pnf-agro') {
    badgeStyles = 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-600/20';
    dotColor = 'bg-amber-700';
  }

  const sizeStyles =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5'
      : size === 'lg'
      ? 'text-xs px-3 py-1 font-bold'
      : 'text-[11px] px-2.5 py-0.5 font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-all ${badgeStyles} ${sizeStyles}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
      <span>{pnf.name}</span>
      {showModality && (
        <span className="opacity-75 font-normal text-[10px]">
          ({pnf.modality === 'trimestral' ? '3 Tramos / Trimestral' : '2 Tramos / Semestral'})
        </span>
      )}
    </span>
  );
};
