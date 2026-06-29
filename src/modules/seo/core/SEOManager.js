/**
 * SEO Manager - Facade Pattern
 * Single entry point that orchestrates all SEO services
 * Provides simplified API for complex SEO operations
 */

import { base44 } from '@/api/base44Client';
import SEOAuditService from './SEOAuditService';
import KeywordService from './KeywordService';
import ContentService from './ContentService';
import CompetitorService from './CompetitorService';
import OptimizationService from './OptimizationService';

export class SEOManager {
  constructor() {
    this.auditService = new SEOAuditService();
    this.keywordService = new KeywordService();
    this.contentService = new ContentService();
    this.competitorService = new CompetitorService();
    this.optimizationService = new OptimizationService();
  }

  /**
   * Run complete SEO audit and analysis for a website
   * @param {string} websiteId - Website entity ID
   * @returns {Promise<object>} Comprehensive audit results
   */
  async auditWebsite(websiteId) {
    try {
      const [audit, keywords, competitors, contentOpps] = await Promise.all([
        this.auditService.auditWebsite(websiteId),
        this.keywordService.getKeywords(websiteId),
        this.competitorService.analyze(websiteId),
        this.contentService.getOpportunities(websiteId)
      ]);

      return {
        websiteId,
        auditedAt: new Date().toISOString(),
        audit,
        keywords: {
          total: keywords.length,
          topThree: keywords.filter(k => (k.current_rank || 99) <= 3).length,
          topTen: keywords.filter(k => (k.current_rank || 99) <= 10).length,
          data: keywords
        },
        competitors,
        contentOpportunities: {
          total: contentOpps.length,
          highPriority: contentOpps.filter(c => (c.priority_score || 0) >= 70).length,
          data: contentOpps
        },
        summary: this.generateSummary(audit, keywords, contentOpps)
      };
    } catch (error) {
      console.error('SEOManager.auditWebsite error:', error);
      throw error;
    }
  }

  /**
   * Apply all auto-fixable SEO issues
   * @param {string} websiteId - Website ID
   * @param {boolean} autoApply - Whether to auto-apply or generate pending
   * @returns {Promise<object>} Applied fixes
   */
  async applyAutoFixes(websiteId, autoApply = false) {
    return await this.optimizationService.applyFixes(websiteId, autoApply);
  }

  /**
   * Track keyword rankings and identify changes
   * @param {string} websiteId - Website ID
   * @returns {Promise<object>} Ranking updates
   */
  async trackRankings(websiteId) {
    return await this.keywordService.trackRankings(websiteId);
  }

  /**
   * Generate content briefs for topics
   * @param {string} websiteId - Website ID
   * @param {Array<string>} topics - Topics to research
   * @returns {Promise<object>} Generated briefs
   */
  async generateContentBriefs(websiteId, topics) {
    return await this.contentService.generateBriefs(websiteId, topics);
  }

  /**
   * Analyze competitors and find gaps
   * @param {string} websiteId - Website ID
   * @returns {Promise<object>} Competitor analysis
   */
  async analyzeCompetitors(websiteId) {
    return await this.competitorService.analyze(websiteId);
  }

  /**
   * Get comprehensive dashboard data
   * @param {string} websiteId - Website ID
   * @returns {Promise<object>} Dashboard data
   */
  async getDashboardData(websiteId) {
    try {
      const [
        audits,
        keywords,
        competitors,
        opportunities,
        optimizations,
        results
      ] = await Promise.all([
        this.auditService.getAuditHistory(websiteId, 5),
        this.keywordService.getKeywords(websiteId, { limit: 50 }),
        this.competitorService.getAnalysis(websiteId),
        this.contentService.getOpportunities(websiteId),
        this.optimizationService.getOptimizations(websiteId),
        this.getSEOResults(websiteId)
      ]);

      const latestAudit = audits[0];

      return {
        overview: {
          seoScore: latestAudit?.overall_score || 0,
          technicalScore: latestAudit?.technical_score || 0,
          contentScore: latestAudit?.content_score || 0,
          onPageScore: latestAudit?.on_page_score || 0,
          trend: await this.auditService.calculateTrend(latestAudit)
        },
        keywords: {
          total: keywords.length,
          topThree: keywords.filter(k => (k.current_rank || 99) <= 3).length,
          topTen: keywords.filter(k => (k.current_rank || 99) <= 10).length,
          improved: keywords.filter(k => (k.rank_change || 0) > 0).length,
          declined: keywords.filter(k => (k.rank_change || 0) < 0).length
        },
        issues: {
          critical: latestAudit?.issues?.filter(i => i.type === 'critical').length || 0,
          warnings: latestAudit?.issues?.filter(i => i.type === 'warning').length || 0,
          info: latestAudit?.issues?.filter(i => i.type === 'info').length || 0
        },
        opportunities: {
          content: opportunities.length,
          highPriority: opportunities.filter(o => (o.priority_score || 0) >= 70).length
        },
        optimizations: {
          pending: optimizations.filter(o => o.status === 'pending').length,
          applied: optimizations.filter(o => o.status === 'applied').length
        },
        results: {
          total: results.length,
          recentWins: results.slice(0, 6)
        },
        history: {
          audits: audits.slice(0, 10),
          keywords: keywords.slice(0, 20)
        }
      };
    } catch (error) {
      console.error('SEOManager.getDashboardData error:', error);
      throw error;
    }
  }

  /**
   * Get SEO results/achievements
   * @param {string} websiteId - Website ID
   * @returns {Promise<Array>} Results
   */
  async getSEOResults(websiteId) {
    return await base44.entities.SEOResult.filter(
      { website_id: websiteId },
      '-achieved_at',
      50
    );
  }

  /**
   * Generate executive summary
   * @param {object} audit - Audit data
   * @param {Array} keywords - Keywords
   * @param {Array} contentOpps - Content opportunities
   * @returns {object} Summary
   */
  generateSummary(audit, keywords, contentOpps) {
    const criticalIssues = audit.issues?.filter(i => i.type === 'critical').length || 0;
    const topRankings = keywords.filter(k => (k.current_rank || 99) <= 3).length;
    const highPriorityContent = contentOpps.filter(c => (c.priority_score || 0) >= 70).length;

    return {
      health: audit.overall_score >= 80 ? 'excellent' : audit.overall_score >= 60 ? 'good' : 'needs_improvement',
      criticalIssues,
      topRankings,
      contentGaps: highPriorityContent,
      recommendations: this.generateRecommendations(audit, keywords, contentOpps)
    };
  }

  /**
   * Generate actionable recommendations
   * @param {object} audit - Audit data
   * @param {Array} keywords - Keywords
   * @param {Array} contentOpps - Content opportunities
   * @returns {Array} Recommendations
   */
  generateRecommendations(audit, keywords, contentOpps) {
    const recommendations = [];

    // Critical issues first
    const criticalIssues = audit.issues?.filter(i => i.type === 'critical') || [];
    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'critical',
        action: `Fix ${criticalIssues.length} critical SEO issues`,
        impact: 'high',
        effort: 'medium'
      });
    }

    // Ranking opportunities
    const pageTwoKeywords = keywords.filter(k => (k.current_rank || 99) > 10 && (k.current_rank || 99) <= 20);
    if (pageTwoKeywords.length > 0) {
      recommendations.push({
        priority: 'high',
        action: `Optimize ${pageTwoKeywords.length} keywords on page 2 to break into page 1`,
        impact: 'high',
        effort: 'low'
      });
    }

    // Content gaps
    const highPriorityContent = contentOpps.filter(c => (c.priority_score || 0) >= 70);
    if (highPriorityContent.length > 0) {
      recommendations.push({
        priority: 'high',
        action: `Create ${highPriorityContent.length} high-priority content pieces`,
        impact: 'high',
        effort: 'high'
      });
    }

    return recommendations;
  }
}

export default SEOManager;