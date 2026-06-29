/**
 * SEO Event Emitter
 * Decoupled event system for SEO events and notifications
 * Observer Pattern implementation
 */

export class SEOEventEmitter {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an SEO event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event).push(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.events.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit an SEO event
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to event once
   * @param {string} event - Event name
   * @param {Function} callback - Callback
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      callback(data);
    });
    return unsubscribe;
  }

  /**
   * Clear all listeners for an event
   * @param {string} event - Event name
   */
  clear(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// Event types
export const SEO_EVENTS = {
  // Audit events
  AUDIT_STARTED: 'audit:started',
  AUDIT_COMPLETED: 'audit:completed',
  AUDIT_FAILED: 'audit:failed',
  
  // Ranking events
  RANKING_UPDATED: 'ranking:updated',
  RANKING_IMPROVED: 'ranking:improved',
  RANKING_DECLINED: 'ranking:declined',
  
  // Issue events
  ISSUE_DETECTED: 'issue:detected',
  ISSUE_FIXED: 'issue:fixed',
  CRITICAL_ISSUE: 'issue:critical',
  
  // Content events
  CONTENT_OPPORTUNITY: 'content:opportunity',
  CONTENT_CREATED: 'content:created',
  CONTENT_PUBLISHED: 'content:published',
  
  // Competitor events
  COMPETITOR_ANALYZED: 'competitor:analyzed',
  GAP_IDENTIFIED: 'competitor:gap',
  
  // Optimization events
  OPTIMIZATION_PENDING: 'optimization:pending',
  OPTIMIZATION_APPLIED: 'optimization:applied',
  AUTO_FIX_COMPLETED: 'optimization:auto_fix',
  
  // Result events
  MILESTONE_REACHED: 'result:milestone',
  TARGET_ACHIEVED: 'result:target'
};

// Global instance
export const seoEventEmitter = new SEOEventEmitter();

export default SEOEventEmitter;