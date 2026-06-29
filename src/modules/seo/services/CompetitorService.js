/**
 * Competitor Service
 * Handles competitor analysis, gap detection, and competitive intelligence
 * Single Responsibility: Competitor monitoring and analysis
 */

import { base44 } from '@/api/base44Client';

export class CompetitorService {
  constructor() {
    this.analysisMetrics = [
      'estimated_monthly_traffic',
      'domain_authority',
      'total_keywords',
      'backlinks_count'
    ];
  }

  /**
   * Analyze competitors for a website
   * @param {string} websiteId - Website ID
   * @returns {Promise<object>} Analysis results
   */
  async analyzeCompetitors(websiteId) {
    try {
      const website = await base44.entities.Website.get(websiteId);
      if (!website) throw new Error('Website not found');

      if (!website.competitors?.length) {
        throw new Error('No competitors specified for this website');
      }

      const result = await base44.functions.invoke('analyzeCompetitors', {
        website_id: websiteId
      });

      return {
        competitors: result.data?.competitors || [],
        totalGaps: result.data?.total_gaps || 0,
        opportunities: this.identifyOpportunities(result.data?.competitors || []),
        threats: this.identifyThreats(result.data?.competitors || [])
      };
    } catch (error) {
      console.error('CompetitorService.analyzeCompetitors error:', error);
      throw error;
    }
  }

  /**
   * Get competitor analysis data
   * @param {string} websiteId - Website ID
   * @returns {Promise<Array>} Competitor analyses
   */
  async getAnalyses(websiteId) {
    return await base44.entities.CompetitorAnalysis.filter(
      { website_id: websiteId },
      '-analyzed_at',
      10
    );
  }

  /**
   * Get latest competitor analysis
   * @param {string} websiteId - Website ID
   * @returns {Promise<object|null>} Latest analysis
   */
  async getLatestAnalysis(websiteId) {
    const analyses = await this.getAnalyses(websiteId);
    return analyses[0] || null;
  }

  /**
   * Identify opportunities from competitor data
   * @param {Array} competitors - Competitor data
   * @returns {Array} Opportunities
   */
  identifyOpportunities(competitors) {
    const opportunities = [];
    
    competitors.forEach(comp => {
      // Content gaps where we can outrank them
      (comp.content_gaps || []).forEach(gap => {
        if (gap.our_position === null || gap.our_position > gap.their_position + 5) {
          opportunities.push({
            type: 'content_gap',
            keyword: gap.keyword,
            theirPosition: gap.their_position,
            ourPosition: gap.our_position,
            opportunityScore: gap.opportunity_score,
            competitor: comp.competitor_url,
            action: gap.recommended_action,
            priority: gap.opportunity_score >= 70 ? 'high' : gap.opportunity_score >= 40 ? 'medium' : 'low'
          });
        }
      });

      // Keywords they rank for that we don't track
      if (comp.total_keywords > 100 && !comp.top_keywords?.length) {
        opportunities.push({
          type: 'missing_keywords',
          competitor: comp.competitor_url,
          theirKeywords: comp.total_keywords,
          action: 'Research their top keywords and add to tracking'
        });
      }
    });

    return opportunities.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Identify threats from competitor data
   * @param {Array} competitors - Competitor data
   * @returns {Array} Threats
   */
  identifyThreats(competitors) {
    const threats = [];

    competitors.forEach(comp => {
      // Competitors with much higher traffic
      if (comp.estimated_monthly_traffic > 10000) {
        threats.push({
          type: 'high_traffic_competitor',
          competitor: comp.competitor_url,
          theirTraffic: comp.estimated_monthly_traffic,
          severity: 'high',
          action: 'Focus on niche keywords they don\'t dominate'
        });
      }

      // Competitors with strong domain authority
      if (comp.domain_authority > 50) {
        threats.push({
          type: 'high_authority_competitor',
          competitor: comp.competitor_url,
          theirDA: comp.domain_authority,
          severity: 'medium',
          action: 'Build quality backlinks to improve domain authority'
        });
      }

      // Keywords where they outrank us significantly
      (comp.top_keywords || []).forEach(kw => {
        if (kw.position <= 3) {
          threats.push({
            type: 'dominated_keyword',
            keyword: kw.keyword,
            theirPosition: kw.position,
            competitor: comp.competitor_url,
            severity: kw.position === 1 ? 'high' : 'medium',
            action: `Optimize content for "${kw.keyword}" to improve ranking`
          });
        }
      });
    });

    return threats.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Compare our site vs competitor
   * @param {string} websiteId - Website ID
   * @param {string} competitorUrl - Competitor URL
   * @returns {Promise<object>} Comparison data
   */
  async compareWithCompetitor(websiteId, competitorUrl) {
    const analyses = await this.getAnalyses(websiteId);
    const competitor = analyses
      .flatMap(a => a.competitors || [])
      .find(c => c.competitor_url === competitorUrl);

    if (!competitor) {
      throw new Error('Competitor not found in analysis');
    }

    const website = await base44.entities.Website.get(websiteId);

    return {
      ourSite: {
        url: website.url,
        traffic: website.estimated_traffic || 'N/A',
        keywords: website.target_keywords?.length || 0,
        seoScore: website.seo_health_score || 0
      },
      competitor: {
        url: competitor.competitor_url,
        traffic: competitor.estimated_monthly_traffic || 'N/A',
        keywords: competitor.total_keywords || 0,
        domainAuthority: competitor.domain_authority || 0
      },
      gaps: competitor.content_gaps?.length || 0,
      theirTopKeywords: competitor.top_keywords?.slice(0, 5) || []
    };
  }

  /**
   * Get competitor keyword overlap
   * @param {string} websiteId - Website ID
   * @returns {Promise<object>} Keyword overlap analysis
   */
  async getKeywordOverlap(websiteId) {
    const analyses = await this.getLatestAnalysis(websiteId);
    if (!analyses) return { overlapping: [], unique: [], totalOverlap: 0 };

    const allCompetitorKeywords = new Set();
    (analyses.top_keywords || []).forEach(kw => {
      allCompetitorKeywords.add(kw.keyword);
    });

    // Get our keywords
    const ourKeywords = await base44.entities.KeywordTracker.filter(
      { website_id: websiteId },
      null,
      100
    );

    const ourKeywordSet = new Set(ourKeywords.map(k => k.keyword));
    const overlapping = ourKeywords.filter(k => allCompetitorKeywords.has(k.keyword));
    const unique = ourKeywords.filter(k => !allCompetitorKeywords.has(k.keyword));

    return {
      overlapping,
      unique,
      totalOverlap: overlapping.length,
      overlapPercentage: ourKeywords.length > 0
        ? Math.round((overlapping.length / ourKeywords.length) * 100)
        : 0
    };
  }

  /**
   * Track competitor changes over time
   * @param {string} websiteId - Website ID
   * @param {string} competitorUrl - Competitor URL
   * @returns {Promise<Array>} Change history
   */
  async trackCompetitorChanges(websiteId, competitorUrl) {
    const analyses = await this.getAnalyses(websiteId);
    const competitorAnalyses = analyses
      .map(a => ({
        date: a.analyzed_at,
        competitor: (a.competitors || []).find(c => c.competitor_url === competitorUrl)
      }))
      .filter(ca => ca.competitor);

    if (competitorAnalyses.length < 2) return [];

    const changes = [];
    for (let i = 0; i < competitorAnalyses.length - 1; i++) {
      const current = competitorAnalyses[i].competitor;
      const previous = competitorAnalyses[i + 1].competitor;

      changes.push({
        date: competitorAnalyses[i].date,
        trafficChange: (current.estimated_monthly_traffic || 0) - (previous.estimated_monthly_traffic || 0),
        keywordChange: (current.total_keywords || 0) - (previous.total_keywords || 0),
        daChange: (current.domain_authority || 0) - (previous.domain_authority || 0)
      });
    }

    return changes;
  }
}

export default CompetitorService;