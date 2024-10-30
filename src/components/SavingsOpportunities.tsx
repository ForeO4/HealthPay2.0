import React from 'react';
import { Card, Title, BarList } from '@tremor/react';
import { DetailedClaim } from '../types/claims';
import { TrendingDown, AlertCircle, Building, DollarSign } from 'lucide-react';

interface SavingsOpportunityProps {
  claim: DetailedClaim;
  similarClaims: DetailedClaim[];
}

export function SavingsOpportunities({ claim, similarClaims }: SavingsOpportunityProps) {
  // Calculate market averages and potential savings
  const averagePrice = similarClaims.reduce((sum, c) => sum + c.totalAmount, 0) / similarClaims.length;
  const potentialSavings = Math.max(0, claim.totalAmount - averagePrice);
  
  // Calculate item-level savings opportunities
  const itemSavings = claim.items.map(item => {
    const similarItems = similarClaims
      .flatMap(c => c.items)
      .filter(i => i.code === item.code);

    const avgPrice = similarItems.reduce((sum, i) => sum + i.unitPrice, 0) / similarItems.length;
    const potential = Math.max(0, (item.unitPrice - avgPrice) * item.quantity);
    const percentageAbove = ((item.unitPrice - avgPrice) / avgPrice) * 100;

    return {
      code: item.code,
      description: item.description,
      currentPrice: item.unitPrice,
      averagePrice: avgPrice,
      potential,
      percentageAbove,
      frequency: similarItems.length
    };
  }).filter(item => item.potential > 0)
    .sort((a, b) => b.potential - a.potential);

  // Network optimization opportunities
  const networkStats = similarClaims.reduce((acc, c) => {
    const network = c.metadata?.network || 'unknown';
    if (!acc[network]) {
      acc[network] = {
        count: 0,
        totalAmount: 0,
        avgAmount: 0
      };
    }
    acc[network].count++;
    acc[network].totalAmount += c.totalAmount;
    acc[network].avgAmount = acc[network].totalAmount / acc[network].count;
    return acc;
  }, {} as Record<string, { count: number; totalAmount: number; avgAmount: number }>);

  const bestNetwork = Object.entries(networkStats)
    .sort(([,a], [,b]) => a.avgAmount - b.avgAmount)[0];

  const networkSavings = bestNetwork ? 
    Math.max(0, claim.totalAmount - bestNetwork[1].avgAmount) : 0;

  // Generate savings recommendations
  const recommendations = [
    ...(potentialSavings > 0 ? [`Total potential savings of $${potentialSavings.toLocaleString()}`] : []),
    ...(networkSavings > 0 ? [`Switch to ${bestNetwork[0]} network to save $${networkSavings.toLocaleString()}`] : []),
    ...itemSavings
      .filter(item => item.percentageAbove > 20)
      .map(item => `Negotiate ${item.description || item.code} price (${item.percentageAbove.toFixed(0)}% above average)`)
  ];

  const savingsData = itemSavings.map(item => ({
    name: item.description || item.code,
    value: item.potential,
    icon: DollarSign
  }));

  return (
    <Card>
      <div className="flex items-center space-x-2 mb-6">
        <TrendingDown className="h-5 w-5 text-blue-500" />
        <Title>Savings Opportunities</Title>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">Total Potential</span>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-blue-700">
            ${potentialSavings.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-blue-600">
            {((potentialSavings / claim.totalAmount) * 100).toFixed(1)}% of claim
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-700">Network Savings</span>
            <Building className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-green-700">
            ${networkSavings.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-green-600">
            Via network optimization
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700">Items Above Avg</span>
            <AlertCircle className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-purple-700">
            {itemSavings.length}
          </p>
          <p className="mt-1 text-sm text-purple-600">
            Items with savings potential
          </p>
        </div>
      </div>

      {itemSavings.length > 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Savings by Item</h3>
            <BarList data={savingsData} className="mt-2" />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Detailed Analysis</h3>
            {itemSavings.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {item.description || item.code}
                    </h4>
                    <div className="mt-1 text-sm text-gray-500">
                      Current: ${item.currentPrice.toLocaleString()} vs. 
                      Average: ${item.averagePrice.toLocaleString()}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Based on {item.frequency} similar claims
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-600">
                      Save ${item.potential.toLocaleString()}
                    </span>
                    <div className="mt-1 text-sm text-gray-500">
                      {item.percentageAbove.toFixed(1)}% above avg
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${Math.min(100, (item.averagePrice / item.currentPrice) * 100)}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Recommendations</h3>
                <ul className="mt-2 text-sm text-yellow-700 list-disc pl-5 space-y-1">
                  {recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {itemSavings.length === 0 && (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Optimal Pricing</h3>
              <p className="mt-1 text-sm text-green-700">
                All items are priced at or below market average. No immediate savings opportunities identified.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}