import React from 'react';
import Dashboard from '../pages/Dashboard';

class SafeDashboard extends React.Component {
  state = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Dashboard error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-dark-900 border border-red-600/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Dashboard Error</h2>
            <p className="text-golden-300 mb-4">There was an error loading the dashboard. This is likely due to backend connectivity issues.</p>
            <details className="mt-4">
              <summary className="cursor-pointer text-golden-400 hover:text-golden-300">Error Details</summary>
              <pre className="mt-2 text-sm text-golden-400/80 overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-golden-500 text-dark-900 rounded hover:bg-golden-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return <Dashboard />;
  }
}

export default SafeDashboard;