'use client';

import React, { useState } from 'react';
import { CheckoutSessionRequest, CheckoutSessionResponse } from '@/types/domain';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

interface StripeCheckoutButtonProps {
  tierId?: number;
  animalId?: number;
  isAnnual?: boolean;
  buttonText?: string;
  className?: string;
  onSuccessRedirect?: (url: string) => void;
  onError?: (errorMessage: string) => void;
}

export const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({
  tierId,
  animalId,
  isAnnual = false,
  buttonText = 'Proceder al Pago Seguro',
  className = '',
  onSuccessRedirect,
  onError,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuthStore();
  const { error: toastError, warning: toastWarning } = useToast();

  const handleCheckout = async () => {
    if (loading) return;

    if (!isAuthenticated || !token) {
      toastWarning("Sesión requerida", "Por favor inicia sesión para apadrinar a un animal.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const payload: CheckoutSessionRequest = {
        tier_id: tierId,
        animal_id: animalId,
        is_annual: isAnnual,
        success_url: typeof window !== 'undefined' ? `${window.location.origin}/gracias` : undefined,
        cancel_url: typeof window !== 'undefined' ? `${window.location.origin}/cancelar` : undefined,
      };

      const response = await api.post<CheckoutSessionResponse>('/sponsorship/checkout/', payload);
      const data = response.data;

      if (data?.checkout_url) {
        if (onSuccessRedirect) {
          onSuccessRedirect(data.checkout_url);
        } else if (typeof window !== 'undefined') {
          window.location.href = data.checkout_url;
        }
      } else {
        throw new Error('No se recibió la URL de Stripe Checkout.');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      let msg = 'Ocurrió un error inesperado al conectar con Stripe.';
      
      if (status === 401) {
        msg = 'Tu sesión ha caducado. Por favor vuelve a iniciar sesión.';
        toastWarning('Sesión expirada', msg);
      } else {
        msg = err?.response?.data?.error || err?.message || msg;
        toastError('Error de Pasarela', msg);
      }

      setErrorMessage(msg);
      if (onError) {
        onError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={`relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition-all duration-200 hover:from-amber-400 hover:to-emerald-500 hover:shadow-amber-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin text-slate-950" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Conectando con Stripe...
          </span>
        ) : (
          buttonText
        )}
      </button>

      {errorMessage ? (
        <p className="text-xs font-medium text-rose-400 bg-rose-950/40 border border-rose-800/40 p-2.5 rounded-lg text-center">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};

export default StripeCheckoutButton;
