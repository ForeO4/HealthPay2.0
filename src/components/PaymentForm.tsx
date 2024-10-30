import React, { useState } from 'react';
import { PaymentMethod, PaymentTransaction } from '../types/payment';
import { useAuthStore } from '../store/authStore';

interface PaymentFormProps {
  onSubmit: (transaction: PaymentTransaction) => Promise<void>;
  amount: number;
  description: string;
}

export function PaymentForm({ onSubmit, amount, description }: PaymentFormProps) {
  const [paymentType, setPaymentType] = useState<'ach' | 'card' | 'check'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const paymentMethod: PaymentMethod = {
        id: crypto.randomUUID(),
        type: paymentType,
        lastFour: formData.get('lastFour') as string,
        isDefault: formData.get('makeDefault') === 'true',
        metadata: {
          bankName: formData.get('bankName') as string,
          cardBrand: formData.get('cardBrand') as string,
          expiryDate: formData.get('expiryDate') as string,
        },
      };

      const transaction: PaymentTransaction = {
        id: crypto.randomUUID(),
        amount,
        currency: 'USD',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentMethod,
        metadata: {
          description,
          patientId: user?.id,
        },
        auditLog: [],
      };

      await onSubmit(transaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <div className="mt-2 space-x-4">
          {['card', 'ach', 'check'].map((type) => (
            <label key={type} className="inline-flex items-center">
              <input
                type="radio"
                name="paymentType"
                value={type}
                checked={paymentType === type}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700 capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {paymentType === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <input
              type="text"
              name="lastFour"
              pattern="\d{4}"
              maxLength={4}
              placeholder="Last 4 digits"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              type="text"
              name="expiryDate"
              placeholder="MM/YY"
              pattern="\d\d/\d\d"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      )}

      {(paymentType === 'ach' || paymentType === 'check') && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bank Name
            </label>
            <input
              type="text"
              name="bankName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Number
            </label>
            <input
              type="text"
              name="lastFour"
              pattern="\d{4}"
              maxLength={4}
              placeholder="Last 4 digits"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          name="makeDefault"
          value="true"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Save for future payments
        </label>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}