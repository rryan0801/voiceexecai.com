// SEO Module Exports
// Central export point for all SEO module components
// Makes extraction to standalone app easier

// Services (OOP Layer)
export { default as SEOAuditService } from './services/SEOAuditService';
export { default as KeywordService } from './services/KeywordService';
export { default as ContentService } from './services/ContentService';
export { default as CompetitorService } from './services/CompetitorService';
export { default as OptimizationService } from './services/OptimizationService';

// Core
export { default as SEOManager } from './core/SEOManager';
export { default as SEOEventEmitter } from './core/SEOEventEmitter';

// Components
export { default as SEODashboard } from './components/SEODashboard';
export { default as AddWebsiteForm } from './components/AddWebsiteForm';
export { default as WebsiteCard } from './components/WebsiteCard';
export { default as ResultsShowcase } from './components/ResultsShowcase';
export { default as ContentOpportunities } from './components/ContentOpportunities';
export { default as CompetitorAnalysis } from './components/CompetitorAnalysis';
export { default as VoiceCommand } from './components/VoiceCommand';

// Pages
export { default as SEOAutomator } from './pages/SEOAutomator';

// API
export { seoApi } from './api/seoApi';

// Hooks
export { useSEO } from './hooks/useSEO';

// Named exports for convenience
export * from './api/seoApi';