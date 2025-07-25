import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-red-600/30 rounded-lg p-8 max-w-2xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
              <p className="text-golden-300 mb-6">
                An error occurred while loading this page. Please try refreshing the page or contact support if the problem persists.
              </p>
              
              {this.state.error && (
                <div className="bg-dark-800 border border-red-600/20 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-red-400 font-medium mb-2">Error Details:</h3>
                  <p className="text-red-300 text-sm font-mono">{this.state.error.message}</p>
                </div>
              )}
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-golden-600 text-dark-900 rounded-lg hover:bg-golden-700 transition-colors font-medium"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 border border-golden-600/30 text-golden-400 rounded-lg hover:bg-golden-600/10 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 