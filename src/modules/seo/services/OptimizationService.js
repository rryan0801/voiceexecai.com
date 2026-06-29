/**
 * Optimization Service
 * Handles SEO fixes, meta tag generation, structured data, and auto-optimizations
 * Single Responsibility: Applying SEO optimizations
 */

import { base44 } from '@/api/base44Client';

export class OptimizationService {
  constructor() {
    this.optimizationTypes = {
      meta_title: { priority: 'high', effort: 'low', impact: 'high' },
      meta_description: { priority: 'high', effort: 'low', impact: 'medium' },
      og_tags: { priority: 'medium', effort: 'low', impact: 'medium' },
      structured_data: { priority: 'high', effort: 'medium', impact: 'high' },
      heading: { priority: 'medium', effort: 'medium', impact: 'medium' },
      content: { priority: 'medium', effort: 'high', impact: 'high' },
      image_alt: { priority: 'low', effort: 'medium', impact: 'low' }
    };
  }

  /**
   * Get pending optimizations for a website
   * @param {string} websiteId - Website ID
   * @returns {Promise<Array>} Optimizations
   */
  async getOptimizations(websiteId) {
    return await base44.entities.SEOOptimization.filter(
      { website_id: websiteId },
      '-applied_at',
      100
    );
  }

  /**
   * Get pending optimizations only
   * @param {string} websiteId - Website ID
   * @returns {Promise<Array>} Pending optimizations
   */
  async getPendingOptimizations(websiteId) {
    const optimizations = await this.getOptimizations(websiteId);
    return optimizations.filter(opt => opt.status === 'pending');
  }

  /**
   * Apply SEO fixes automatically
   * @param {string} websiteId - Website ID
   * @param {boolean} autoApply - Whether to auto-apply or just generate
   * @returns {Promise<object>} Results
   */
  async applyFixes(websiteId, autoApply = false) {
    try {
      const result = await base44.functions.invoke('applySEOFixes', {
        website_id: websiteId,
        auto_apply: autoApply
      });

      const optimizations = result.data?.optimizations || [];
      
      return {
        optimizations,
        applied: optimizations.filter(o => o.status === 'applied').length,
        pending: optimizations.filter(o => o.status === 'pending').length,
        totalEstimatedImpact: this.calculateTotalImpact(optimizations)
      };
    } catch (error) {
      console.error('OptimizationService.applyFixes error:', error);
      throw error;
    }
  }

  /**
   * Generate meta tags for a page
   * @param {string} websiteId - Website ID
   * @param {string} pageUrl - Page URL
   * @returns {Promise<object>} Generated meta tags
   */
  async generateMetaTags(websiteId, pageUrl) {
    try {
      const result = await base44.functions.invoke('generateSEOMetaTags', {
        website_id: websiteId,
        page_url: pageUrl
      });

      const metaTags = result.data;
      
      // Create optimization record
      const optimization = await base44.entities.SEOOptimization.create({
        website_id: websiteId,
        page_url: pageUrl,
        optimization_type: 'meta_title',
        original_value: metaTags.original_title || '',
        optimized_value: metaTags.title || '',
        status: 'pending',
        impact_score: this.estimateImpact('meta_title'),
        applied_at: null
      });

      return {
        metaTags,
        optimizationId: optimization.id,
        recommendations: this.generateMetaRecommendations(metaTags)
      };
    } catch (error) {
      console.error('OptimizationService.generateMetaTags error:', error);
      throw error;
    }
  }

  /**
   * Create structured data for a page
   * @param {string} websiteId - Website ID
   * @param {string} pageUrl - Page URL
   * @param {string} schemaType - Schema type (e.g., 'Article', 'Product', 'LocalBusiness')
   * @returns {Promise<object>} Generated structured data
   */
  async createStructuredData(websiteId, pageUrl, schemaType = 'Article') {
    try {
      const result = await base44.functions.invoke('createStructuredData', {
        website_id: websiteId,
        page_url: pageUrl,
        schema_type: schemaType
      });

      const structuredData = result.data;
      
      // Create optimization record
      const optimization = await base44.entities.SEOOptimization.create({
        website_id: websiteId,
        page_url: pageUrl,
        optimization_type: 'structured_data',
        original_value: '',
        optimized_value: JSON.stringify(structuredData, null, 2),
        status: 'pending',
        impact_score: this.estimateImpact('structured_data'),
        applied_at: null
      });

      return {
        structuredData,
        optimizationId: optimization.id,
        schemaType,
        validationStatus: this.validateSchema(structuredData)
      };
    } catch (error) {
      console.error('OptimizationService.createStructuredData error:', error);
      throw error;
    }
  }

  /**
   * Apply a specific optimization
   * @param {string} optimizationId - Optimization entity ID
   * @returns {Promise<object>} Result
   */
  async applyOptimization(optimizationId) {
    try {
      const optimization = await base44.entities.SEOOptimization.get(optimizationId);
      if (!optimization) throw new Error('Optimization not found');

      // Update status to applied
      const updated = await base44.entities.SEOOptimization.update(optimizationId, {
        status: 'applied',
        applied_at: new Date().toISOString(),
        applied_by: 'user'
      });

      return {
        success: true,
        optimization: updated,
        message: 'Optimization applied successfully'
      };
    } catch (error) {
      console.error('OptimizationService.applyOptimization error:', error);
      throw error;
    }
  }

  /**
   * Apply multiple optimizations at once
   * @param {Array<string>} optimizationIds - IDs to apply
   * @returns {Promise<object>} Batch result
   */
  async applyBatch(optimizationIds) {
    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const id of optimizationIds) {
      try {
        const result = await this.applyOptimization(id);
        results.push({ id, success: true, result });
        successCount++;
      } catch (error) {
        results.push({ id, success: false, error: error.message });
        failCount++;
      }
    }

    return {
      total: optimizationIds.length,
      success: successCount,
      failed: failCount,
      results
    };
  }

  /**
   * Estimate impact score for optimization type
   * @param {string} type - Optimization type
   * @returns {number} Impact score (0-100)
   */
  estimateImpact(type) {
    const impactScores = {
      meta_title: 85,
      meta_description: 70,
      og_tags: 60,
      structured_data: 90,
      heading: 65,
      content: 80,
      image_alt: 40
    };
    return impactScores[type] || 50;
  }

  /**
   * Calculate total impact of optimizations
   * @param {Array} optimizations - Optimizations
   * @returns {number} Total impact score
   */
  calculateTotalImpact(optimizations) {
    return optimizations.reduce((sum, opt) => {
      return sum + (opt.impact_score || this.estimateImpact(opt.optimization_type));
    }, 0);
  }

  /**
   * Generate meta tag recommendations
   * @param {object} metaTags - Generated meta tags
   * @returns {Array} Recommendations
   */
  generateMetaRecommendations(metaTags) {
    const recommendations = [];

    if (!metaTags.title || metaTags.title.length < 30) {
      recommendations.push({
        type: 'warning',
        message: 'Title tag is too short (min 30 characters recommended)',
        suggestion: 'Expand title to include primary keyword'
      });
    }

    if (metaTags.title?.length > 60) {
      recommendations.push({
        type: 'warning',
        message: 'Title tag may be truncated in search results',
        suggestion: 'Shorten to 50-60 characters'
      });
    }

    if (!metaTags.description || metaTags.description.length < 120) {
      recommendations.push({
        type: 'warning',
        message: 'Meta description is too short',
        suggestion: 'Expand to 150-160 characters for optimal display'
      });
    }

    return recommendations;
  }

  /**
   * Validate schema.org structured data
   * @param {object} schema - Schema data
   * @returns {object} Validation result
   */
  validateSchema(schema) {
    const requiredFields = ['@context', '@type'];
    const missing = requiredFields.filter(field => !schema[field]);

    return {
      valid: missing.length === 0,
      errors: missing.map(field => `Missing required field: ${field}`),
      warnings: []
    };
  }

  /**
   * Get optimization statistics
   * @param {string} websiteId - Website ID
   * @returns {Promise<object>} Stats
   */
  async getStats(websiteId) {
    const optimizations = await this.getOptimizations(websiteId);
    
    return {
      total: optimizations.length,
      applied: optimizations.filter(o => o.status === 'applied').length,
      pending: optimizations.filter(o => o.status === 'pending').length,
      rejected: optimizations.filter(o => o.status === 'rejected').length,
      byType: this.groupByType(optimizations),
      avgImpactScore: optimizations.length > 0
        ? Math.round(optimizations.reduce((sum, o) => sum + (o.impact_score || 0), 0) / optimizations.length)
        : 0
    };
  }

  /**
   * Group optimizations by type
   * @param {Array} optimizations - Optimizations
   * @returns {object} Grouped by type
   */
  groupByType(optimizations) {
    return optimizations.reduce((groups, opt) => {
      const type = opt.optimization_type || 'other';
      if (!groups[type]) groups[type] = 0;
      groups[type]++;
      return groups;
    }, {});
  }
}

export default OptimizationService;