'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Animal } from '@/types/domain';

interface AnimalCardProps {
  animal: Animal;
  onSponsorSelect?: (animal: Animal) => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onSponsorSelect }) => {
  const [loading, setLoading] = useState(false);

  const handleSponsorClick = () => {
    if (loading) return;
    setLoading(true);
    try {
      if (onSponsorSelect) {
        onSponsorSelect(animal);
      }
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadgeColor = (status?: string) => {
    switch (status) {
      case 'EXCELLENT':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'GOOD':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'RECOVERING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const hasUpdates = (animal?.updates?.length ?? 0) > 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900/80 p-5 backdrop-blur-md transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10">
      {/* Image container */}
      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl bg-slate-800">
        {animal?.image_url ? (
          <Image
            src={animal.image_url}
            alt={animal.name || 'Animal del santuario'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-900/40 to-amber-900/40 text-amber-200/50">
            <span className="text-sm font-medium">Tierra Viva Santuario</span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md ${getHealthBadgeColor(
              animal?.health_status
            )}`}
          >
            {animal?.health_status_display || animal?.health_status || 'Saludable'}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 transition-colors">
            {animal?.name ?? 'Animal del Santuario'}
          </h3>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-800/40">
            {animal?.species ?? 'Especie Rescatada'}
          </span>
        </div>

        <p className="line-clamp-3 text-sm text-slate-300/90 leading-relaxed">
          {animal?.description ?? animal?.bio ?? 'Animal protegido en nuestro santuario sustentable.'}
        </p>

        {hasUpdates ? (
          <div className="pt-2 text-xs text-amber-300/80 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            {(animal?.updates?.length ?? 0)} actualización(es) de rancho disponible(s)
          </div>
        ) : null}
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {(animal?.sponsors_count ?? 0) > 0
            ? `${animal?.sponsors_count} padrino(s) activo(s)`
            : 'Sé el primero en apadrinar'}
        </span>

        <button
          type="button"
          onClick={handleSponsorClick}
          disabled={loading || animal?.is_adopted}
          className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition-all duration-200 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : animal?.is_adopted ? 'Apadrinado' : 'Apadrinar'}
        </button>
      </div>
    </div>
  );
};

export default AnimalCard;
