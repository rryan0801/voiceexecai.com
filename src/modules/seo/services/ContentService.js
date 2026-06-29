/**
 * Content Service
 * Handles content opportunities, brief generation, and AI content creation
 * Single Responsibility: Content strategy and creation
 */

import { base44 } from '@/api/base44Client';

export class ContentService {
  constructor() {
    this.contentTypes = {
      blog_post: { wordCount: 1500, effort: 'medium' },
      guide: { wordCount: 3000, effort: 'high' },
      comparison: { wordCount: 2000, effort: 'medium' },
      listicle: { wordCount: 1200, effort: 'low' },
      case_study: { wordCount: 1800, effort: 'high' },
      landing_page: { wordCount: 800, effort: 'medium' },
      product_page: { wordCount: 600, effort: 'low' }
    };
  }

  /**
   * Get content opportunities for a website
   * @param {string} websiteId - Website ID
   * @returns {Promise<Array>} Content opportunities
   */
  async getOpportunities(websiteId) {
    return await base44.entities.ContentOpportunity.filter(
      { website_id: websiteId },
      '-priority_score',
      50
    );
  }

  /**
   * Generate content briefs for topics
   * @param {string} websiteId - Website ID
   * @param {Array<string>} topics - Topics to create briefs for
   * @returns {Promise<object>} Generated briefs
   */
  async generateBriefs(websiteId, topics) {
    try {
      const result = await base44.functions.invoke('generateContentBriefs', {
        website_id: websiteId,
        topics
      });

      return {
        briefs: result.data?.briefs || [],
        opportunities: result.data?.opportunities || [],
        totalEstimatedTraffic: this.calculateTrafficPotential(result.data?.opportunities || [])
      };
    } catch (error) {
      console.error('ContentService.generateBriefs error:', error);
      throw error;
    }
  }

  /**
   * Write full SEO content for an opportunity
   * @param {string} opportunityId - Content opportunity ID
   * @returns {Promise<object>} Generated content
   */
  async writeContent(opportunityId) {
    try {
      const result = await base44.functions.invoke('writeSEOContent', {
        opportunity_id: opportunityId
      });

      // Update the opportunity with generated content
      await base44.entities.ContentOpportunity.update(opportunityId, {
        ai_generated_content: result.data?.content,
        status: 'content_created'
      });

      return {
        content: result.data?.content,
        wordCount: result.data?.word_count,
        estimatedReadTime: Math.ceil((result.data?.word_count || 0) / 200),
        seoScore: result.data?.seo_score
      };
    } catch (error) {
      console.error('ContentService.writeContent error:', error);
      throw error;
    }
  }

  /**
   * Identify content gaps from competitor analysis
   * @param {string} websiteId - Website ID
   * @returns {Promise<Array>} Content gaps
   */
  async identifyGaps(websiteId) {
    try {
      const analyses = await base44.entities.CompetitorAnalysis.filter(
        { website_id: websiteId },
        '-analyzed_at',
        1
      );

      if (!analyses?.length) return [];

      const gaps = analyses[0].content_gaps || [];
      
      return gaps
        .map(gap => ({
          ...gap,
          contentType: this.recommendContentType(gap),
          estimatedWordCount: this.estimateWordCount(gap),
          priority: this.calculateGapPriority(gap)
        }))
        .sort((a, b) => b.priority - a.priority);
    } catch (error) {
      console.error('ContentService.identifyGaps error:', error);
      return [];
    }
  }

  /**
   * Create content calendar based on opportunities
   * @param {string} websiteId - Website ID
   * @param {number} weeks - Weeks to plan
   * @returns {Promise<Array>} Content calendar
   */
  async createCalendar(websiteId, weeks = 4) {
    const opportunities = await this.getOpportunities(websiteId);
    const highPriority = opportunities.filter(opp => opp.priority_score >= 70);
    
    const calendar = [];
    const postsPerWeek = 2;
    
    for (let week = 0; week < weeks; week++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() + (week * 7));
      
      const weekOpps = highPriority.slice(
        week * postsPerWeek,
        (week + 1) * postsPerWeek
      );
      
      weekOpps.forEach((opp, idx) => {
        calendar.push({
          week: week + 1,
          scheduledDate: new Date(weekStart.getTime() + (idx * 3 * 24 * 60 * 60 * 1000)),
          topic: opp.topic,
          contentType: opp.content_type || 'blog_post',
          targetKeywords: opp.target_keywords || [],
          estimatedTraffic: opp.estimated_traffic_potential,
          status: 'scheduled',
          opportunityId: opp.id
        });
      });
    }
    
    return calendar;
  }

  /**
   * Recommend content type based on keyword intent
   * @param {object} gap - Content gap data
   * @returns {string} Recommended content type
   */
  recommendContentType(gap) {
    const intent = gap.intent || 'informational';
    const volume = gap.search_volume || 0;
    
    if (intent === 'transactional') return 'landing_page';
    if (intent === 'commercial') return 'comparison';
    if (volume > 5000) return 'guide';
    if (gap.keyword?.includes('best') || gap.keyword?.includes('vs')) return 'comparison';
    if (gap.keyword?.includes('how to') || gap.keyword?.includes('guide')) return 'guide';
    
    return 'blog_post';
  }

  /**
   * Estimate word count for content
   * @param {object} gap - Content gap data
   * @returns {number} Estimated word count
   */
  estimateWordCount(gap) {
    const contentType = this.recommendContentType(gap);
    return this.contentTypes[contentType]?.wordCount || 1500;
  }

  /**
   * Calculate priority score for content gap
   * @param {object} gap - Content gap data
   * @returns {number} Priority score
   */
  calculateGapPriority(gap) {
    const volumeScore = Math.min(40, (gap.search_volume || 0) / 100);
    const gapScore = Math.min(30, (gap.their_position - (gap.our_position || 99)) * 3);
    const intentScore = gap.intent === 'transactional' ? 30 : gap.intent === 'commercial' ? 20 : 10;
    
    return Math.min(100, Math.round(volumeScore + gapScore + intentScore));
  }

  /**
   * Calculate total traffic potential
   * @param {Array} opportunities - Content opportunities
   * @returns {number} Total estimated traffic
   */
  calculateTrafficPotential(opportunities) {
    return opportunities.reduce(
      (sum, opp) => sum + (opp.estimated_traffic_potential || 0),
      0
    );
  }

  /**
   * Get content performance metrics
   * @param {string} websiteId - Website ID
   * @returns {Promise<object>} Performance metrics
   */
  async getPerformanceMetrics(websiteId) {
    const opportunities = await this.getOpportunities(websiteId);
    
    return {
      total: opportunities.length,
      published: opportunities.filter(o => o.status === 'published').length,
      inProgress: opportunities.filter(o => o.status === 'content_created').length,
      briefReady: opportunities.filter(o => o.status === 'brief_ready').length,
      identified: opportunities.filter(o => o.status === 'identified').length,
      totalTrafficPotential: this.calculateTrafficPotential(opportunities)
    };
  }
}

export default ContentService;