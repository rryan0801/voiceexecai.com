// SEO Module API
// Centralized API wrapper for SEO operations
// This module can be extracted to a standalone app with minimal changes

import { base44 } from '@/api/base44Client';

export const seoApi = {
  // Websites
  async getWebsites(userId) {
    const query = userId ? { user_id: userId } : {};
    return await base44.entities.Website.filter(query);
  },

  async createWebsite(data) {
    return await base44.entities.Website.create(data);
  },

  async updateWebsite(id, data) {
    return await base44.entities.Website.update(id, data);
  },

  async deleteWebsite(id) {
    return await base44.entities.Website.delete(id);
  },

  // SEO Audits
  async getAudits(websiteId) {
    return await base44.entities.SEOAudit.filter({ website_id: websiteId }, '-audited_at', 10);
  },

  async runAudit(websiteId) {
    return await base44.functions.invoke('analyzeWebsiteSEO', { website_id: websiteId });
  },

  // Keywords
  async getKeywords(websiteId) {
    return await base44.entities.KeywordTracker.filter({ website_id: websiteId }, '-last_checked', 50);
  },

  async trackKeywords(websiteId) {
    return await base44.functions.invoke('trackKeywordRankings', { website_id: websiteId });
  },

  async researchKeywords(websiteId, seedKeywords) {
    return await base44.functions.invoke('researchKeywords', { 
      website_id: websiteId,
      seed_keywords: seedKeywords 
    });
  },

  // Competitors
  async getCompetitors(websiteId) {
    return await base44.entities.CompetitorAnalysis.filter({ website_id: websiteId }, '-analyzed_at', 10);
  },

  async analyzeCompetitors(websiteId) {
    return await base44.functions.invoke('analyzeCompetitors', { website_id: websiteId });
  },

  // Content Opportunities
  async getContentOpportunities(websiteId) {
    return await base44.entities.ContentOpportunity.filter({ website_id: websiteId }, '-priority_score', 20);
  },

  async generateContentBriefs(websiteId, topics) {
    return await base44.functions.invoke('generateContentBriefs', { 
      website_id: websiteId,
      topics 
    });
  },

  async writeSEOContent(opportunityId) {
    return await base44.functions.invoke('writeSEOContent', { opportunity_id: opportunityId });
  },

  // Optimizations
  async getOptimizations(websiteId) {
    return await base44.entities.SEOOptimization.filter({ website_id: websiteId }, '-applied_at', 20);
  },

  async applySEOFixes(websiteId, optimizationIds) {
    return await base44.functions.invoke('applySEOFixes', { 
      website_id: websiteId,
      optimization_ids: optimizationIds 
    });
  },

  async generateMetaTags(websiteId, pageUrl) {
    return await base44.functions.invoke('generateSEOMetaTags', { 
      website_id: websiteId,
      page_url: pageUrl 
    });
  },

  async createStructuredData(websiteId, pageUrl) {
    return await base44.functions.invoke('createStructuredData', { 
      website_id: websiteId,
      page_url: pageUrl 
    });
  },

  // Results & Metrics
  async getResults(websiteId) {
    return await base44.entities.SEOResult.filter({ website_id: websiteId }, '-achieved_at', 50);
  },

  async getOrganicTraffic(websiteId) {
    return await base44.entities.OrganicTraffic.filter({ website_id: websiteId }, '-tracked_at', 30);
  },

  async syncOrganicTraffic(websiteId) {
    return await base44.functions.invoke('syncOrganicTraffic', { website_id: websiteId });
  },

  // Automation
  async runFullAuditAutomation(websiteId) {
    return await base44.functions.invoke('runSEOAuditAutomation', { website_id: websiteId });
  },
};

export default seoApi;