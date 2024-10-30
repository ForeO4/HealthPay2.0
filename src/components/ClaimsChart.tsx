import React from 'react';
import { DetailedClaim } from '../types/claims';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ClaimsChartProps {
  claims: DetailedClaim[];
}

export function ClaimsChart({ claims }: ClaimsChartProps) {
  // Process data for the chart
  const chartData = claims.reduce((acc: Record<string, { date: string; total: number; approved: number; pending: number; denied: number }>, claim) => {
    const date = format(new Date(claim.dateOfService), 'MMM dd');
    if (!acc[date]) {
      acc[date] = { date, total: 0, approved: 0, pending: 0, denied: 0 };
    }
    
    acc[date].total += claim.totalAmount;
    switch (claim.status) {
      case 'approved':
        acc[date].approved += claim.totalAmount;
        break;
      case 'pending':
        acc[date].pending += claim.totalAmount;
        break;
      case 'denied':
        acc[date].denied += claim.totalAmount;
        break;
    }
    
    return acc;
  }, {});

  const data = Object.values(chartData).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
          />
          <Area 
            type="monotone" 
            dataKey="approved" 
            stackId="1"
            stroke="#10B981" 
            fill="#10B981" 
            fillOpacity={0.6}
            name="Approved"
          />
          <Area 
            type="monotone" 
            dataKey="pending" 
            stackId="1"
            stroke="#F59E0B" 
            fill="#F59E0B" 
            fillOpacity={0.6}
            name="Pending"
          />
          <Area 
            type="monotone" 
            dataKey="denied" 
            stackId="1"
            stroke="#EF4444" 
            fill="#EF4444" 
            fillOpacity={0.6}
            name="Denied"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}