'use client';

import React from 'react';
import { HiveStatus } from '@/types/domain';

interface HiveStatusCardProps {
  hive: HiveStatus;
  onInspectClick?: (hive: HiveStatus) => void;
}

export const HiveStatusCard: React.FC<HiveStatusCardProps> = ({ hive, onInspectClick }) => {
  const getActivityBadge = (level: HiveStatus['activity_level']) => {
    switch (level) {
      case 'PEAK':
        return { label: 'Pico de Actividad', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'HIGH':
        return { label: 'Alta Actividad', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'NORMAL':
        return { label: 'Actividad Normal', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
      case 'LOW':
        return { label: 'Baja Actividad', color: 'bg-slate-500/20 text-slate-400 border-slate-500/40' };
      default:
        return { label: 'En Observación', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    }
  };

  const badge = getActivityBadge(hive?.activity_level);
  const healthScore = hive?.health_score ?? 100;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 backdrop-blur-md transition-all duration-300 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10">
      {/* Background Honeycomb Accent Pattern */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
            Colmena {hive?.code ?? 'N/A'}
          </span>
          <h4 className="text-lg font-bold text-slate-100">
            {hive?.queen_name ? `Reina: ${hive.queen_name}` : 'Colmena Orgánica'}
          </h4>
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="my-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-800/50 p-3 border border-slate-700/40">
          <span className="block text-xs font-medium text-slate-400">Salud del Enjambre</span>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  healthScore > 80 ? 'bg-emerald-400' : healthScore > 50 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, healthScore))}%` }}
              />
            </div>
            <span className="text-xs font-bold text-amber-200">{healthScore}%</span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/50 p-3 border border-slate-700/40">
          <span className="block text-xs font-medium text-slate-400">Cosecha Estimada</span>
          <span className="mt-1 block text-base font-bold text-amber-300">
            {hive?.honey_production_kg ?? 0} kg <span className="text-xs font-normal text-slate-400">de miel</span>
          </span>
        </div>
      </div>

      {/* Location and Last Inspection */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <span>Ubicación: <strong className="text-slate-300">{hive?.location ?? 'Rancho Principal'}</strong></span>
        <span>Inspección: <strong className="text-slate-300">{hive?.last_inspection_date ?? 'Reciente'}</strong></span>
      </div>

      {/* Inspection Action */}
      {onInspectClick ? (
        <button
          type="button"
          onClick={() => onInspectClick(hive)}
          className="mt-4 w-full rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-slate-700 hover:text-amber-100 transition-colors border border-amber-500/20 active:scale-98"
        >
          Ver Reporte Apícola
        </button>
      ) : null}
    </div>
  );
};

export default HiveStatusCard;
