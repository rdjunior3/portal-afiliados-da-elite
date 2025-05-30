import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp: number;
  sessionId: string;
  page?: string;
}

interface UserProperties {
  userId?: string;
  email?: string;
  plan?: string;
  signupDate?: string;
  [key: string]: any;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private userProperties: UserProperties = {};

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadFromStorage();
    
    // Save to localStorage periodically
    setInterval(() => {
      this.saveToStorage();
    }, 30 * 1000); // Every 30 seconds

    // Save before page unload
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('affiliate_analytics');
      if (stored) {
        const data = JSON.parse(stored);
        this.events = data.events || [];
        this.userProperties = data.userProperties || {};
      }
    } catch (error) {
      console.warn('Failed to load analytics from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        events: this.events.slice(-1000), // Keep only last 1000 events
        userProperties: this.userProperties,
        lastSaved: Date.now()
      };
      localStorage.setItem('affiliate_analytics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save analytics to storage:', error);
    }
  }

  setUser(userId: string, properties?: UserProperties): void {
    this.userId = userId;
    this.userProperties = { ...this.userProperties, userId, ...properties };
    
    this.track('user_identified', {
      userId,
      ...properties
    });
  }

  updateUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };
  }

  track(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      userId: this.userId,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: window.location.pathname
    };

    this.events.push(analyticsEvent);
    
    // In production, you would send this to your analytics service
    console.log('Analytics Event:', analyticsEvent);
    
    // Keep only recent events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  page(name?: string, properties?: Record<string, any>): void {
    this.track('page_view', {
      page: name || window.location.pathname,
      url: window.location.href,
      referrer: document.referrer,
      ...properties
    });
  }

  // Conversion tracking
  trackConversion(type: string, value?: number, properties?: Record<string, any>): void {
    this.track('conversion', {
      type,
      value,
      ...properties
    });
  }

  // User flow tracking
  trackUserFlow(step: string, flow: string, properties?: Record<string, any>): void {
    this.track('user_flow', {
      step,
      flow,
      ...properties
    });
  }

  // Performance tracking
  trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
    this.track('performance', {
      metric,
      value,
      ...properties
    });
  }

  // Error tracking
  trackError(error: Error | string, context?: Record<string, any>): void {
    this.track('error', {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context
    });
  }

  // Get analytics data for reporting
  getEvents(filter?: (event: AnalyticsEvent) => boolean): AnalyticsEvent[] {
    return filter ? this.events.filter(filter) : this.events;
  }

  getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  getSessionEvents(): AnalyticsEvent[] {
    return this.events.filter(event => event.sessionId === this.sessionId);
  }

  // Analytics insights
  getInsights() {
    const sessionEvents = this.getSessionEvents();
    const pageViews = this.getEventsByType('page_view');
    const conversions = this.getEventsByType('conversion');
    
    return {
      sessionDuration: sessionEvents.length > 0 
        ? Date.now() - Math.min(...sessionEvents.map(e => e.timestamp))
        : 0,
      pageViews: pageViews.length,
      conversions: conversions.length,
      topPages: this.getTopPages(),
      userProperties: this.userProperties,
      sessionId: this.sessionId
    };
  }

  private getTopPages(): Array<{ page: string; views: number }> {
    const pageViews = this.getEventsByType('page_view');
    const pageCounts = pageViews.reduce((acc, event) => {
      const page = event.properties?.page || event.page || 'unknown';
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }
}

// Global analytics instance
const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  const { user, profile } = useAuth();

  // Set user when authenticated
  useEffect(() => {
    if (user) {
      analytics.setUser(user.id, {
        email: user.email,
        signupDate: user.created_at,
        affiliateStatus: profile?.affiliate_status,
        totalEarnings: profile?.total_earnings
      });
    }
  }, [user, profile]);

  // Track page views
  const trackPage = useCallback((name?: string, properties?: Record<string, any>) => {
    analytics.page(name, properties);
  }, []);

  // Track events
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    analytics.track(event, properties);
  }, []);

  // Track conversions
  const trackConversion = useCallback((type: string, value?: number, properties?: Record<string, any>) => {
    analytics.trackConversion(type, value, properties);
  }, []);

  // Track user flows
  const trackFlow = useCallback((step: string, flow: string, properties?: Record<string, any>) => {
    analytics.trackUserFlow(step, flow, properties);
  }, []);

  // Track performance
  const trackPerformance = useCallback((metric: string, value: number, properties?: Record<string, any>) => {
    analytics.trackPerformance(metric, value, properties);
  }, []);

  // Track errors
  const trackError = useCallback((error: Error | string, context?: Record<string, any>) => {
    analytics.trackError(error, context);
  }, []);

  // Get insights
  const getInsights = useCallback(() => {
    return analytics.getInsights();
  }, []);

  return {
    track,
    trackPage,
    trackConversion,
    trackFlow,
    trackPerformance,
    trackError,
    getInsights,
    analytics // Direct access to analytics instance if needed
  };
}

// Automatic page view tracking
export function usePageTracking() {
  const { trackPage } = useAnalytics();

  useEffect(() => {
    // Track initial page view
    trackPage();

    // Track page changes (for SPA navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => trackPage(), 0);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => trackPage(), 0);
    };

    window.addEventListener('popstate', () => {
      setTimeout(() => trackPage(), 0);
    });

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [trackPage]);
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const { trackPerformance } = useAnalytics();

  useEffect(() => {
    // Track page load time
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            trackPerformance('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
            trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.loadEventStart);
            trackPerformance('first_paint', navigation.domComplete - navigation.loadEventStart);
          }
        }, 0);
      });
    }

    // Track unhandled errors
    const handleError = (event: ErrorEvent) => {
      trackPerformance('javascript_error', 1, {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [trackPerformance]);
}

export default analytics; 