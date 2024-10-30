import React from 'react';
import { DetailedClaim } from '../types/claims';
import { DonutChart } from '@tremor/react';

interface StatusDistributionProps {
  claims: DetailedClaim[];
}

export function StatusDistribution({ claims }: StatusDistributionProps) {
  const distribution = claims.reduce((acc, claim) => {
    acc[claim.status] = (acc[claim.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { name: 'Approved', value: distribution.approved || 0 },
    { name: 'Pending', value: distribution.pending || 0 },
    { name: 'Denied', value: distribution.denied || 0 },
  ];

  const colors = {
    Approved: 'emerald',
    Pending: 'amber',
    Denied: 'rose',
  };

  return (
    <DonutChart
      data={data}
      category="value"
      index="name"
      colors={[colors.Approved, colors.Pending, colors.Denied]}
      valueFormatter={(value) => `${value} claims`}
      className="h-52"
    />
  );
}