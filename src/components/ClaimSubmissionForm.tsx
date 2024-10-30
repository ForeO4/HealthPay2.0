import React, { useState } from 'react';
import { DetailedClaim, ClaimItem, Diagnosis } from '../types/claims';
import { Plus, Minus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface ClaimSubmissionFormProps {
  onSubmit: (claim: DetailedClaim) => Promise<void>;
}

export function ClaimSubmissionForm({ onSubmit }: ClaimSubmissionFormProps) {
  const { user } = useAuthStore();
  const [items, setItems] = useState<ClaimItem[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        code: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalAmount: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<ClaimItem>) => {
    setItems(items.map(item => 
      item.id === id 
        ? { 
            ...item, 
            ...updates,
            totalAmount: updates.quantity !== undefined || updates.unitPrice !== undefined
              ? (updates.quantity ?? item.quantity) * (updates.unitPrice ?? item.unitPrice)
              : item.totalAmount
          }
        : item
    ));
  };

  const addDiagnosis = () => {
    setDiagnoses([
      ...diagnoses,
      {
        code: '',
        description: '',
        type: 'primary',
      },
    ]);
  };

  const removeDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
  };

  const updateDiagnosis = (index: number, updates: Partial<Diagnosis>) => {
    setDiagnoses(diagnoses.map((diagnosis, i) => 
      i === index ? { ...diagnosis, ...updates } : diagnosis
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      const claim: DetailedClaim = {
        id: crypto.randomUUID(),
        patientId: user?.id || '',
        providerId: formData.get('providerId') as string,
        facilityId: formData.get('facilityId') as string,
        dateOfService: formData.get('dateOfService') as string,
        submissionDate: new Date().toISOString(),
        status: 'pending',
        type: formData.get('type') as DetailedClaim['type'],
        items,
        diagnoses,
        totalAmount: items.reduce((sum, item) => sum + item.totalAmount, 0),
        coveredAmount: 0,
        patientResponsibility: 0,
        metadata: {
          priorAuthNumber: formData.get('priorAuthNumber') as string,
          emergencyCare: formData.get('emergencyCare') === 'true',
          placeOfService: formData.get('placeOfService') as string,
        },
        auditTrail: [],
      };

      await onSubmit(claim);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Provider ID
              </label>
              <input
                type="text"
                name="providerId"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Facility ID
              </label>
              <input
                type="text"
                name="facilityId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Date of Service
              </label>
              <input
                type="date"
                name="dateOfService"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Claim Type
              </label>
              <select
                name="type"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="medical">Medical</option>
                <option value="dental">Dental</option>
                <option value="vision">Vision</option>
                <option value="pharmacy">Pharmacy</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Claim Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>

            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-start">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={item.code}
                        onChange={(e) => updateItem(item.id, { code: e.target.value })}
                        placeholder="CPT/HCPCS Code"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                        placeholder="Quantity"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                        placeholder="Unit Price"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="Description"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="mt-1 p-1 text-gray-400 hover:text-red-500"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Diagnoses</h3>
              <button
                type="button"
                onClick={addDiagnosis}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Diagnosis
              </button>
            </div>

            {diagnoses.map((diagnosis, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={diagnosis.code}
                        onChange={(e) => updateDiagnosis(index, { code: e.target.value })}
                        placeholder="ICD-10 Code"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={diagnosis.type}
                        onChange={(e) => updateDiagnosis(index, { type: e.target.value as 'primary' | 'secondary' })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                      </select>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={diagnosis.description}
                    onChange={(e) => updateDiagnosis(index, { description: e.target.value })}
                    placeholder="Description"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeDiagnosis(index)}
                  className="mt-1 p-1 text-gray-400 hover:text-red-500"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Claim'}
        </button>
      </div>
    </form>
  );
}