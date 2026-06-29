/**
 * Keyword Service
 * Handles keyword research, tracking, ranking analysis, and opportunity scoring
 * Single Responsibility: All keyword-related operations
 */

import { base44 } from '@/api/base44Client';

export class KeywordService {
  constructor() {
    this.intentWeights = {
      transactional: 1.5,
      commercial: 1.3,
      informational: 1.0,
      navigational: 0.8
    };
  }

  /**
   * Research keywords for a website
   * @param {string} websiteId - Website entity ID
   * @param {Array<string>} seedKeywords - Initial keywords to expand from
   * @returns {Promise<object>} Research results
   */
  async researchKeywords(websiteId, seedKeywords = []) {
    try {
      const website = await base44.entities.Website.get(websiteId);
      if (!website) throw new Error('Website not found');

      const result = await base44.functions.invoke('researchKeywords', {
        website_id: websiteId,
        seed_keywords: seedKeywords.length > 0 
          ? seedKeywords 
          : website.target_keywords || []
      });

      return {
        keywords: result.data?.keywords || [],
        totalVolume: this.calculateTotalVolume(result.data?.keywords || []),
        avgDifficulty: this.calculateAvgDifficulty(result.data?.keywords || []),
        opportunities: this.identifyOpportunities(result.data?.keywords || [])
      };
    } catch (error) {
      console.error('KeywordService.researchKeywords error:', error);
      throw error;
    }
  }

  /**
   * Track keyword rankings for a website
   * @param {string} websiteId - Website ID
   * @returns {Promise<object>} Updated rankings
   */
  async trackRankings(websiteId) {
    try {
      const result = await base44.functions.invoke('trackKeywordRankings', {
        website_id: websiteId
      });

      const keywords = result.data?.keywords || [];
      
      return {
        keywords,
        improved: keywords.filter(k => (k.rank_change || 0) > 0).length,
        declined: keywords.filter(k => (k.rank_change || 0) < 0).length,
        stable: keywords.filter(k => (k.rank_change || 0) === 0).length,
        topThree: keywords.filter(k => (k.current_rank || 99) <= 3).length,
        topTen: keywords.filter(k => (k.current_rank || 99) <= 10).length
      };
    } catch (error) {
      console.error('KeywordService.trackRankings error:', error);
      throw error;
    }
  }

  /**
   * Get all tracked keywords for a website
   * @param {string} websiteId - Website ID
   * @param {object} filters - Optional filters
   * @returns {Promise<Array>} Keywords
   */
  async getKeywords(websiteId, filters = {}) {
    const query = { website_id: websiteId };
    
    if (filters.intent) {
      query.intent = filters.intent;
    }
    
    if (filters.minVolume) {
      query.search_volume = { $gte: filters.minVolume };
    }

    return await base44.entities.KeywordTracker.filter(
      query,
      '-opportunity_score',
      filters.limit || 100
    );
  }

  /**
   * Calculate keyword opportunity score (0-100)
   * @param {object} keyword - Keyword data
   * @returns {number} Opportunity score
   */
  calculateOpportunityScore(keyword) {
    const {
      search_volume = 0,
      difficulty = 100,
      current_rank,
      intent = 'informational'
    } = keyword;

    // Volume score (0-40 points)
    const volumeScore = Math.min(40, (search_volume / 1000) * 40);

    // Difficulty score (0-30 points, inverted - lower is better)
    const difficultyScore = (100 - difficulty) / 100 * 30;

    // Rank opportunity (0-20 points, higher rank = less opportunity)
    const rankScore = current_rank 
      ? Math.max(0, (20 - current_rank)) 
      : 20;

    // Intent multiplier
    const intentMultiplier = this.intentWeights[intent] || 1.0;

    const baseScore = volumeScore + difficultyScore + rankScore;
    return Math.min(100, Math.round(baseScore * intentMultiplier));
  }

  /**
   * Identify high-opportunity keywords
   * @param {Array} keywords - Keyword list
   * @returns {Array} Opportunities sorted by score
   */
  identifyOpportunities(keywords) {
    return keywords
      .map(kw => ({
        ...kw,
        opportunity_score: this.calculateOpportunityScore(kw)
      }))
      .filter(kw => kw.opportunity_score >= 60)
      .sort((a, b) => b.opportunity_score - a.opportunity_score);
  }

  /**
   * Find keyword gaps vs competitors
   * @param {string} websiteId - Website ID
   * @returns {Promise<Array>} Keyword gaps
   */
  async findKeywordGaps(websiteId) {
    try {
      const website = await base44.entities.Website.get(websiteId);
      if (!website || !website.competitors?.length) {
        return [];
      }

      // Get competitor analysis
      const analyses = await base44.entities.CompetitorAnalysis.filter(
        { website_id: websiteId },
        '-analyzed_at',
        1
      );

      if (!analyses?.length) return [];

      const gaps = analyses[0].content_gaps || [];
      return gaps
        .filter(gap => (gap.our_position || 99) > (gap.their_position || 99))
        .sort((a, b) => b.opportunity_score - a.opportunity_score);
    } catch (error) {
      console.error('KeywordService.findKeywordGaps error:', error);
      return [];
    }
  }

  /**
   * Get ranking trends for a keyword
   * @param {string} keywordId - Keyword entity ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Ranking history
   */
  async getRankingTrend(keywordId, days = 30) {
    const keyword = await base44.entities.KeywordTracker.get(keywordId);
    if (!keyword) return [];

    // This would need historical data storage - for now return mock trend
    return [
      { date: days + 'd ago', rank: keyword.previous_rank || keyword.current_rank },
      { date: 'today', rank: keyword.current_rank }
    ];
  }

  /**
   * Calculate total search volume
   * @param {Array} keywords - Keywords
   * @returns {number} Total volume
   */
  calculateTotalVolume(keywords) {
    return keywords.reduce((sum, kw) => sum + (kw.search_volume || 0), 0);
  }

  /**
   * Calculate average difficulty
   * @param {Array} keywords - Keywords
   * @returns {number} Average difficulty
   */
  calculateAvgDifficulty(keywords) {
    if (!keywords.length) return 0;
    const sum = keywords.reduce((acc, kw) => acc + (kw.difficulty || 0), 0);
    return Math.round(sum / keywords.length);
  }

  /**
   * Group keywords by intent
   * @param {Array} keywords - Keywords
   * @returns {object} Grouped by intent
   */
  groupByIntent(keywords) {
    return keywords.reduce((groups, kw) => {
      const intent = kw.intent || 'informational';
      if (!groups[intent]) groups[intent] = [];
      groups[intent].push(kw);
      return groups;
    }, {});
  }

  /**
   * Get keywords by ranking position
   * @param {string} websiteId - Website ID
   * @param {string} positionRange - 'top3', 'top10', 'top20', 'outside20'
   * @returns {Promise<Array>} Filtered keywords
   */
  async getByPosition(websiteId, positionRange) {
    const keywords = await this.getKeywords(websiteId);
    
    const filters = {
      top3: k => (k.current_rank || 99) <= 3,
      top10: k => (k.current_rank || 99) <= 10,
      top20: k => (k.current_rank || 99) <= 20,
      outside20: k => (k.current_rank || 99) > 20
    };

    return keywords.filter(filters[positionRange] || (() => true));
  }
}

export default KeywordService;