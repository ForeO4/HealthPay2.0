import React, { useState } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { ClaimsChart } from '../components/ClaimsChart';
import { RecentActivity } from '../components/RecentActivity';
import { StatusDistribution } from '../components/StatusDistribution';
import { FraudDetectionCard } from '../components/FraudDetectionCard';
import { DollarSign, FileText, CreditCard, Activity, Filter } from 'lucide-react';
import { DateRangePicker } from '../components/DateRangePicker';
import { useClaimStore } from '../store/claimStore';

export function Dashboard() {
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date()
  ]);
  
  const claims = useClaimStore(state => state.claims);

  // Filter claims by date range
  const filteredClaims = claims.filter(claim => {
    const claimDate = new Date(claim.dateOfService);
    return claimDate >= dateRange[0] && claimDate <= dateRange[1];
  });

  // Calculate metrics
  const totalAmount = filteredClaims.reduce((sum, claim) => sum + claim.totalAmount, 0);
  const openClaims = filteredClaims.filter(claim => claim.status === 'pending').length;
  const recentPayments = filteredClaims
    .filter(claim => claim.status === 'approved')
    .reduce((sum, claim) => sum + claim.totalAmount, 0);
  const paymentActivity = filteredClaims.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Claims Value"
          value={`$${totalAmount.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Open Claims"
          value={openClaims}
          icon={FileText}
          trend={{ value: 5, isPositive: false }}
        />
        <DashboardCard
          title="Recent Payments"
          value={`$${recentPayments.toLocaleString()}`}
          icon={CreditCard}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="Payment Activity"
          value={paymentActivity}
          icon={Activity}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Claims Overview</h2>
            <ClaimsChart claims={filteredClaims} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
            <StatusDistribution claims={filteredClaims} />
          </div>

          <FraudDetectionCard claims={filteredClaims} />
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <RecentActivity claims={filteredClaims.slice(0, 5)} />
          </div>
        </div>
      </div>
    </div>
  );
}