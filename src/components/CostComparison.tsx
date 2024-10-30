import React from 'react';
import { Card, BarChart, Title, BarList } from '@tremor/react';
import { DetailedClaim } from '../types/claims';
import { DollarSign, TrendingDown, AlertCircle } from 'lucide-react';

interface CostComparisonProps {
  claim: DetailedClaim;
  similarClaims: DetailedClaim[];
}

export function CostComparison({ claim, similarClaims }: CostComparisonProps) {
  // Calculate key metrics
  const averagePrice = similarClaims.reduce((sum, c) => sum + c.totalAmount, 0) / similarClaims.length;
  const medianPrice = similarClaims
    .map(c => c.totalAmount)
    .sort((a, b) => a - b)[Math.floor(similarClaims.length / 2)];
  
  const percentile = (
    similarClaims.filter(c => c.totalAmount <= claim.totalAmount).length / 
    similarClaims.length
  ) * 100;

  // Calculate item-level comparisons
  const itemComparisons = claim.items.map(item => {
    const similarItems = similarClaims
      .flatMap(c => c.items)
      .filter(i => i.code === item.code);
    
    const avgPrice = similarItems.reduce((sum, i) => sum + i.unitPrice, 0) / similarItems.length;
    const variance = ((item.unitPrice - avgPrice) / avgPrice) * 100;
    
    return {
      name: item.description || item.code,
      currentPrice: item.unitPrice,
      averagePrice: avgPrice,
      variance,
      quantity: item.quantity
    };
  });

  const marketData = [
    { name: 'Your Cost', value: claim.totalAmount },
    { name: 'Market Average', value: averagePrice },
    { name: 'Market Median', value: medianPrice },
    { name: 'Lowest Cost', value: Math.min(...similarClaims.map(c => c.totalAmount)) },
    { name: 'Highest Cost', value: Math.max(...similarClaims.map(c => c.totalAmount)) }
  ];

  return (
    <Card>
      <div className="flex items-center space-x-2 mb-6">
        <DollarSign className="h-5 w-5 text-blue-500" />
        <Title>Cost Analysis</Title>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">Market Position</span>
            <TrendingDown className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-blue-700">
            {percentile.toFixed(0)}th
          </p>
          <p className="mt-1 text-sm text-blue-600">
            Percentile
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-700">Cost Variance</span>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-green-700">
            {((claim.totalAmount - averagePrice) / averagePrice * 100).toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-green-600">
            vs. Market Average
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700">Similar Claims</span>
            <AlertCircle className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-purple-700">
            {similarClaims.length}
          </p>
          <p className="mt-1 text-sm text-purple-600">
            Analyzed
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Market Price Comparison</h3>
          <BarChart
            data={marketData}
            index="name"
            categories={["value"]}
            colors={["blue"]}
            valueFormatter={(value) => `$${value.toLocaleString()}`}
            yAxisWidth={64}
            className="h-48"
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Item-level Analysis</h3>
          <div className="space-y-4">
            {itemComparisons.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <span className={`text-sm font-medium ${
                    item.variance > 10 ? 'text-red-600' : 
                    item.variance < -10 ? 'text-green-600' : 
                    'text-gray-600'
                  }`}>
                    {item.variance > 0 ? '+' : ''}{item.variance.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Your Price: ${item.currentPrice.toLocaleString()}</span>
                  <span>Market Avg: ${item.averagePrice.toLocaleString()}</span>
                </div>
                <div className="mt-2 relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${Math.min(100, (item.currentPrice / item.averagePrice) * 100)}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        item.variance > 10 ? 'bg-red-500' :
                        item.variance < -10 ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {claim.totalAmount > averagePrice * 1.1 && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">Cost Insights</h4>
                <ul className="mt-2 text-sm text-yellow-700 list-disc pl-5 space-y-1">
                  <li>Total cost is {((claim.totalAmount / averagePrice - 1) * 100).toFixed(1)}% above market average</li>
                  {itemComparisons
                    .filter(item => item.variance > 20)
                    .map((item, index) => (
                      <li key={index}>
                        {item.name} is significantly above market rate ({item.variance.toFixed(1)}% higher)
                      </li>
                    ))}
                  <li>Consider reviewing pricing for items with high variance</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}