/**
 * SEO Type Definitions
 * JSDoc type definitions for better IDE support and documentation
 */

/**
 * @typedef {Object} Website
 * @property {string} id
 * @property {string} user_id
 * @property {string} url
 * @property {string} name
 * @property {string} industry
 * @property {Array<string>} target_keywords
 * @property {Array<string>} competitors
 * @property {number} seo_health_score
 * @property {string} last_audit_date
 * @property {boolean} google_search_console_connected
 * @property {boolean} google_analytics_connected
 * @property {string} status
 * @property {string} created_at
 */

/**
 * @typedef {Object} SEOAudit
 * @property {string} id
 * @property {string} website_id
 * @property {number} overall_score
 * @property {number} technical_score
 * @property {number} content_score
 * @property {number} on_page_score
 * @property {Array<SEOAuditIssue>} issues
 * @property {Array<string>} recommendations
 * @property {number} pages_analyzed
 * @property {string} audited_at
 */

/**
 * @typedef {Object} SEOAuditIssue
 * @property {string} type - critical|warning|info
 * @property {string} category - technical|content|on_page|performance
 * @property {string} title
 * @property {string} description
 * @property {string} url
 * @property {string} fix_suggestion
 * @property {boolean} auto_fixable
 */

/**
 * @typedef {Object} KeywordTracker
 * @property {string} id
 * @property {string} website_id
 * @property {string} keyword
 * @property {number} search_volume
 * @property {number} difficulty
 * @property {number} cpc
 * @property {string} intent - informational|commercial|navigational|transactional
 * @property {number} current_rank
 * @property {number} previous_rank
 * @property {number} rank_change
 * @property {string} url_ranking
 * @property {number} opportunity_score
 * @property {string} tracked_since
 * @property {string} last_checked
 */

/**
 * @typedef {Object} ContentOpportunity
 * @property {string} id
 * @property {string} website_id
 * @property {string} topic
 * @property {Array<string>} target_keywords
 * @property {number} search_volume
 * @property {number} difficulty
 * @property {string} intent
 * @property {string} content_type
 * @property {number} estimated_traffic_potential
 * @property {ContentBrief} content_brief
 * @property {string} ai_generated_content
 * @property {string} status
 * @property {number} priority_score
 * @property {string} created_at
 */

/**
 * @typedef {Object} ContentBrief
 * @property {string} suggested_title
 * @property {string} meta_description
 * @property {Array<string>} outline
 * @property {number} word_count
 * @property {Array<string>} key_points
 * @property {Array<string>} internal_links
 * @property {Array<string>} external_references
 */

/**
 * @typedef {Object} CompetitorAnalysis
 * @property {string} id
 * @property {string} website_id
 * @property {string} competitor_url
 * @property {string} competitor_name
 * @property {number} estimated_monthly_traffic
 * @property {number} domain_authority
 * @property {number} total_keywords
 * @property {Array<CompetitorKeyword>} top_keywords
 * @property {Array<ContentGap>} content_gaps
 * @property {number} backlinks_count
 * @property {Array<string>} top_referring_domains
 * @property {string} analyzed_at
 */

/**
 * @typedef {Object} SEOOptimization
 * @property {string} id
 * @property {string} website_id
 * @property {string} page_url
 * @property {string} optimization_type
 * @property {string} original_value
 * @property {string} optimized_value
 * @property {string} status - pending|applied|rejected
 * @property {number} impact_score
 * @property {string} applied_at
 * @property {string} applied_by
 */

/**
 * @typedef {Object} SEOResult
 * @property {string} id
 * @property {string} website_id
 * @property {string} metric_type
 * @property {string} title
 * @property {string} description
 * @property {number} before_value
 * @property {number} after_value
 * @property {number} improvement_percentage
 * @property {string} impact - low|medium|high|massive
 * @property {number} estimated_revenue_impact
 * @property {string} achieved_at
 */

/**
 * @typedef {Object} DashboardData
 * @property {OverviewData} overview
 * @property {KeywordMetrics} keywords
 * @property {IssueMetrics} issues
 * @property {OpportunityMetrics} opportunities
 * @property {OptimizationMetrics} optimizations
 * @property {ResultMetrics} results
 * @property {HistoryData} history
 */

/**
 * @typedef {Object} OverviewData
 * @property {number} seoScore
 * @property {number} technicalScore
 * @property {number} contentScore
 * @property {number} onPageScore
 * @property {string} trend
 */

/**
 * @typedef {Object} KeywordMetrics
 * @property {number} total
 * @property {number} topThree
 * @property {number} topTen
 * @property {number} improved
 * @property {number} declined
 */

/**
 * @typedef {Object} IssueMetrics
 * @property {number} critical
 * @property {number} warnings
 * @property {number} info
 */

/**
 * @typedef {Object} OpportunityMetrics
 * @property {number} content
 * @property {number} highPriority
 */

/**
 * @typedef {Object} OptimizationMetrics
 * @property {number} pending
 * @property {number} applied
 */

/**
 * @typedef {Object} ResultMetrics
 * @property {number} total
 * @property {Array<SEOResult>} recentWins
 */

/**
 * @typedef {Object} HistoryData
 * @property {Array<SEOAudit>} audits
 * @property {Array<KeywordTracker>} keywords
 */

export {};