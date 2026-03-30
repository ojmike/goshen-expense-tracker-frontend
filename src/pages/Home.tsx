import { useEffect, useState } from 'react';
import api from '../services/api';

interface HealthStatus {
  status: string;
  database: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<HealthStatus>('/health')
      .then((res) => setHealth(res.data))
      .catch(() => setError('Failed to connect to API'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Goshen Expense Tracker
        </h1>

        {error && (
          <p className="text-red-600 font-medium">{error}</p>
        )}

        {health && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Status:</span>
              <span className="font-semibold text-green-600">{health.status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database:</span>
              <span className="font-semibold text-green-600">{health.database}</span>
            </div>
          </div>
        )}

        {!health && !error && (
          <p className="text-gray-400">Loading...</p>
        )}
      </div>
    </div>
  );
}
