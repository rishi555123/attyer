'use client';
import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle size={64} className="text-terracotta mb-6" />
          <h1 className="font-display text-3xl text-kashish mb-4">Something went wrong</h1>
          <p className="font-body text-sand mb-8 max-w-md">
            We&apos;re sorry, but an unexpected error occurred. Our team has been notified.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="bg-kashish text-ivory px-6 py-3 rounded-md font-label tracking-widest hover:bg-terracotta transition-colors mb-4"
          >
            Try Again
          </button>
          <Link href="/" className="text-terracotta underline font-body text-sm hover:text-deepred">
            Return to Homepage
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}
