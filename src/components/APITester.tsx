'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  geminiApi: 'success' | 'error' | 'testing' | null;
  mongodb: 'success' | 'error' | 'testing' | null;
  message?: string;
}

export default function APITester() {
  const [testResult, setTestResult] = useState<TestResult>({
    geminiApi: null,
    mongodb: null
  });

  const testAPIs = async () => {
    setTestResult({ geminiApi: 'testing', mongodb: 'testing' });

    try {
      // Test API connectivity (you could create a test endpoint)
      const response = await fetch('/api/test-connection', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      setTestResult({
        geminiApi: result.geminiApi ? 'success' : 'error',
        mongodb: result.mongodb ? 'success' : 'error',
        message: result.message
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult({
        geminiApi: 'error',
        mongodb: 'error',
        message: 'Failed to test connections'
      });
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'testing':
        return <AlertCircle className="w-4 h-4 text-yellow-600 animate-pulse" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="text-sm">API Connection Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Gemini AI API</span>
          {getStatusIcon(testResult.geminiApi)}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">MongoDB</span>
          {getStatusIcon(testResult.mongodb)}
        </div>

        <Button 
          onClick={testAPIs} 
          size="sm" 
          variant="outline" 
          className="w-full"
          disabled={testResult.geminiApi === 'testing'}
        >
          Test Connections
        </Button>

        {testResult.message && (
          <p className="text-xs text-gray-600 mt-2">{testResult.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
