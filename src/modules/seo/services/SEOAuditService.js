/**
 * SEO Audit Service
 * Handles comprehensive website SEO audits, scoring, and issue detection
 * Single Responsibility: Audit logic and scoring algorithms
 */

import { base44 } from '@/api/base44Client';

export class SEOAuditService {
  constructor() {
    this.scoringWeights = {
      technical: 0.35,
      content: 0.30,
      onPage: 0.25,
      performance: 0.10
    };
  }

  /**
   * Run comprehensive SEO audit for a website
   * @param {string} websiteId - The website entity ID
   * @returns {Promise<object>} Audit results
   */
  async auditWebsite(websiteId) {
    try {
      const website = await base44.entities.Website.get(websiteId);
      if (!website) {
        throw new Error('Website not found');
      }

      // Run backend audit function
      const result = await base44.functions.invoke('analyzeWebsiteSEO', {
        website_id: websiteId
      });

      // Calculate composite scores
      const audit = result.data;
      audit.calculatedScores = this.calculateScores(audit);
      audit.priorityIssues = this.identifyPriorityIssues(audit);
      audit.quickWins = this.identifyQuickWins(audit);

      return audit;
    } catch (error) {
      console.error('SEOAuditService.auditWebsite error:', error);
      throw error;
    }
  }

  /**
   * Calculate weighted scores from audit data
   * @param {object} audit - Raw audit data
   * @returns {object} Calculated scores
   */
  calculateScores(audit) {
    const { technical_score = 0, content_score = 0, on_page_score = 0 } = audit;
    
    const overall = (
      (technical_score || 0) * this.scoringWeights.technical +
      (content_score || 0) * this.scoringWeights.content +
      (on_page_score || 0) * this.scoringWeights.onPage
    );

    return {
      overall: Math.round(overall),
      technical: technical_score || 0,
      content: content_score || 0,
      on_page: on_page_score || 0,
      trend: this.calculateTrend(audit)
    };
  }

  /**
   * Identify priority issues (critical + high impact)
   * @param {object} audit - Audit data
   * @returns {array} Priority issues sorted by impact
   */
  identifyPriorityIssues(audit) {
    const issues = audit.issues || [];
    
    return issues
      .filter(issue => issue.type === 'critical' || issue.type === 'warning')
      .sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.type] - severityOrder[b.type];
      })
      .map(issue => ({
        ...issue,
        priority: this.calculateIssuePriority(issue),
        estimatedImpact: this.estimateImpact(issue)
      }));
  }

  /**
   * Find quick wins (easy fixes with high impact)
   * @param {object} audit - Audit data
   * @returns {array} Quick win opportunities
   */
  identifyQuickWins(audit) {
    const issues = audit.issues || [];
    
    return issues
      .filter(issue => issue.auto_fixable === true && issue.type !== 'info')
      .map(issue => ({
        ...issue,
        effort: 'low',
        impact: 'medium',
        fixTime: '< 1 minute'
      }));
  }

  /**
   * Calculate issue priority score (0-100)
   * @param {object} issue - Issue object
   * @returns {number} Priority score
   */
  calculateIssuePriority(issue) {
    const severityScores = { critical: 100, warning: 60, info: 20 };
    const categoryWeights = { technical: 1.2, content: 1.0, on_page: 1.1, performance: 0.9 };
    
    const baseScore = severityScores[issue.type] || 50;
    const categoryMultiplier = categoryWeights[issue.category] || 1.0;
    
    return Math.round(baseScore * categoryMultiplier);
  }

  /**
   * Estimate business impact of fixing an issue
   * @param {object} issue - Issue object
   * @returns {string} Impact level
   */
  estimateImpact(issue) {
    const highImpactCategories = ['technical', 'on_page'];
    const criticalIssues = ['meta', 'title', 'canonical', 'sitemap', 'robots'];
    
    if (issue.type === 'critical') return 'high';
    if (highImpactCategories.includes(issue.category)) return 'medium';
    if (criticalIssues.some(kw => issue.title?.toLowerCase().includes(kw))) return 'medium';
    
    return 'low';
  }

  /**
   * Calculate trend from previous audits
   * @param {object} audit - Current audit
   * @returns {string} Trend direction
   */
  async calculateTrend(audit) {
    try {
      const previousAudits = await base44.entities.SEOAudit.filter(
        { website_id: audit.website_id },
        '-audited_at',
        2
      );

      if (previousAudits.length < 2) return 'stable';

      const prevScore = previousAudits[1].overall_score || 0;
      const currentScore = audit.overall_score || 0;
      const diff = currentScore - prevScore;

      if (diff >= 5) return 'improving';
      if (diff <= -5) return 'declining';
      return 'stable';
    } catch {
      return 'stable';
    }
  }

  /**
   * Get audit history for a website
   * @param {string} websiteId - Website ID
   * @param {number} limit - Number of audits to retrieve
   * @returns {Promise<Array>} Audit history
   */
  async getAuditHistory(websiteId, limit = 10) {
    return await base44.entities.SEOAudit.filter(
      { website_id: websiteId },
      '-audited_at',
      limit
    );
  }

  /**
   * Compare current audit with previous
   * @param {string} websiteId - Website ID
   * @returns {Promise<object>} Comparison data
   */
  async compareWithPrevious(websiteId) {
    const audits = await this.getAuditHistory(websiteId, 2);
    
    if (audits.length < 2) {
      return {
        current: audits[0] || null,
        previous: null,
        changes: null
      };
    }

    const [current, previous] = audits;
    const changes = {
      overall: (current.overall_score || 0) - (previous.overall_score || 0),
      technical: (current.technical_score || 0) - (previous.technical_score || 0),
      content: (current.content_score || 0) - (previous.content_score || 0),
      on_page: (current.on_page_score || 0) - (previous.on_page_score || 0),
      issuesChange: (current.issues?.length || 0) - (previous.issues?.length || 0)
    };

    return { current, previous, changes };
  }
}

export default SEOAuditService;