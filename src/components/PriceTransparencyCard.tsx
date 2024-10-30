import React, { useState } from 'react';
import { DollarSign, TrendingUp, Building, Shield, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { DetailedClaim } from '../types/claims';
import { BarChart, Card, DonutChart } from '@tremor/react';

interface PriceTransparencyCardProps {
  claim: DetailedClaim;
  similarClaims: DetailedClaim[];
}

export function PriceTransparencyCard({ claim, similarClaims }: PriceTransparencyCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const averagePrice = similarClaims.reduce((sum, c) => sum + c.totalAmount, 0) / similarClaims.length;
  const priceRange = {
    min: Math.min(...similarClaims.map(c => c.totalAmount)),
    max: Math.max(...similarClaims.map(c => c.totalAmount))
  };

  // Calculate price percentile
  const sortedPrices = [...similarClaims.map(c => c.totalAmount), claim.totalAmount].sort((a, b) => a - b);
  const percentile = (sortedPrices.indexOf(claim.totalAmount) / sortedPrices.length) * 100;

  // Analyze price components
  const priceComponents = claim.items.map(item => ({
    name: item.description || item.code,
    value: item.totalAmount,
    average: similarClaims
      .flatMap(c => c.items)
      .filter(i => i.code === item.code)
      .reduce((sum, i) => sum + i.totalAmount, 0) / 
      similarClaims.filter(c => c.items.some(i => i.code === item.code)).length
  }));

  // Network analysis
  const networkDistribution = similarClaims.reduce((acc, c) => {
    const network = c.metadata?.network || 'unknown';
    acc[network] = (acc[network] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priceData = [
    { name: 'Your Cost', value: claim.totalAmount },
    { name: 'Market Average', value: averagePrice },
    { name: 'Minimum', value: priceRange.min },
    { name: 'Maximum', value: priceRange.max }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">Price Analysis</h2>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-500 hover:text-gray-700"
        >
          {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">Price Position</span>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-blue-700">
            {percentile.toFixed(0)}th
          </p>
          <p className="mt-1 text-sm text-blue-600">
            Percentile in market
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-700">Network Status</span>
            <Building className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-green-700">
            {claim.metadata?.network || 'Unknown'}
          </p>
          <p className="mt-1 text-sm text-green-600">
            {((networkDistribution[claim.metadata?.network || 'unknown'] / similarClaims.length) * 100).toFixed(1)}% 
            of similar claims
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700">Cost Variance</span>
            <AlertCircle className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-purple-700">
            {Math.abs(((claim.totalAmount - averagePrice) / averagePrice) * 100).toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-purple-600">
            {claim.totalAmount > averagePrice ? 'Above' : 'Below'} average
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Market Price Comparison</h3>
            <BarChart
              data={priceData}
              index="name"
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              yAxisWidth={64}
              className="h-48"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Cost Breakdown</h3>
              <div className="space-y-3">
                {priceComponents.map((component, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{component.name}</span>
                      <span className="text-sm text-gray-600">${component.value.toLocaleString()}</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            vs. Average ${component.average.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: `${(component.value / component.average) * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Network Distribution</h3>
              <DonutChart
                data={Object.entries(networkDistribution).map(([name, value]) => ({
                  name,
                  value
                }))}
                category="value"
                index="name"
                valueFormatter={(value) => `${value} claims`}
                className="h-48"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">Price Insights</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <ul className="list-disc pl-5 space-y-1">
                    {claim.totalAmount > averagePrice * 1.2 && (
                      <li>This claim is significantly above market average</li>
                    )}
                    {claim.totalAmount < averagePrice * 0.8 && (
                      <li>This claim is significantly below market average</li>
                    )}
                    <li>
                      Market price range: ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}
                    </li>
                    <li>
                      Most common network: {
                        Object.entries(networkDistribution)
                          .sort(([,a], [,b]) => b - a)[0][0]
                      }
                    </li>
                    {priceComponents.some(c => c.value > c.average * 1.5) && (
                      <li>Some services are priced significantly above market rates</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}