import React from 'react';
import { Card, DonutChart, Title, BarList, Flex, Text } from '@tremor/react';
import { DetailedClaim } from '../types/claims';
import { Building, TrendingDown, Shield, AlertCircle } from 'lucide-react';

interface NetworkAnalysisProps {
  claim: DetailedClaim;
  similarClaims: DetailedClaim[];
}

export function NetworkAnalysis({ claim, similarClaims }: NetworkAnalysisProps) {
  // Calculate network statistics
  const networkStats = similarClaims.reduce((acc, c) => {
    const network = c.metadata?.network || 'Unknown';
    if (!acc[network]) {
      acc[network] = {
        count: 0,
        totalAmount: 0,
        avgAmount: 0,
        savings: 0,
        claims: []
      };
    }
    acc[network].count++;
    acc[network].totalAmount += c.totalAmount;
    acc[network].avgAmount = acc[network].totalAmount / acc[network].count;
    acc[network].claims.push(c);
    return acc;
  }, {} as Record<string, { 
    count: number; 
    totalAmount: number; 
    avgAmount: number;
    savings: number;
    claims: DetailedClaim[];
  }>);

  // Calculate potential savings for each network
  Object.values(networkStats).forEach(stats => {
    stats.savings = Math.max(0, claim.totalAmount - stats.avgAmount);
  });

  const networkData = Object.entries(networkStats).map(([name, stats]) => ({
    name,
    value: stats.count,
    avgCost: stats.avgAmount,
    savings: stats.savings
  }));

  // Find best network option
  const bestNetwork = networkData.reduce((best, current) => 
    current.savings > best.savings ? current : best
  );

  return (
    <Card>
      <div className="flex items-center space-x-2 mb-6">
        <Building className="h-5 w-5 text-blue-500" />
        <Title>Network Analysis</Title>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">Current Network</span>
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-blue-700">
            {claim.metadata?.network || 'Unknown'}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-700">Best Network</span>
            <TrendingDown className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-green-700">
            {bestNetwork.name}
          </p>
          <p className="mt-1 text-sm text-green-600">
            Save up to ${bestNetwork.savings.toLocaleString()}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700">Network Coverage</span>
            <Building className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-purple-700">
            {networkData.length}
          </p>
          <p className="mt-1 text-sm text-purple-600">
            Available networks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Flex className="mb-4">
            <Text>Network Distribution</Text>
            <Text>{similarClaims.length} similar claims</Text>
          </Flex>
          <DonutChart
            data={networkData}
            category="value"
            index="name"
            valueFormatter={(value) => `${value} claims`}
            className="h-48"
            colors={["blue", "cyan", "indigo", "violet", "slate"]}
          />
        </div>

        <div>
          <Text className="mb-4">Average Cost by Network</Text>
          <BarList
            data={networkData.map(item => ({
              name: item.name,
              value: item.avgCost,
              icon: Building
            }))}
            valueFormatter={(value) => `$${value.toLocaleString()}`}
            color="blue"
          />
        </div>
      </div>

      {bestNetwork.savings > 0 && (
        <div className="mt-6 bg-yellow-50 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Network Recommendations</h4>
              <ul className="mt-2 text-sm text-yellow-700 list-disc pl-5 space-y-1">
                <li>
                  Consider switching to {bestNetwork.name} network for potential savings 
                  of ${bestNetwork.savings.toLocaleString()}
                </li>
                {claim.metadata?.network === 'out-of-network' && (
                  <li>Current out-of-network status may result in higher costs</li>
                )}
                <li>
                  Average cost in {bestNetwork.name}: ${bestNetwork.avgCost.toLocaleString()} 
                  vs. current: ${claim.totalAmount.toLocaleString()}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}