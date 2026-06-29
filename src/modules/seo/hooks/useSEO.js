// SEO Module Hooks
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seoApi } from '../api/seoApi';
import { toast } from 'sonner';

export function useSEO(websiteId) {
  const queryClient = useQueryClient();

  // Queries
  const { data: websites, isLoading: loadingWebsites } = useQuery({
    queryKey: ['seo', 'websites'],
    queryFn: () => seoApi.getWebsites(),
  });

  const { data: audits, isLoading: loadingAudits } = useQuery({
    queryKey: ['seo', 'audits', websiteId],
    queryFn: () => seoApi.getAudits(websiteId),
    enabled: !!websiteId,
  });

  const { data: keywords, isLoading: loadingKeywords } = useQuery({
    queryKey: ['seo', 'keywords', websiteId],
    queryFn: () => seoApi.getKeywords(websiteId),
    enabled: !!websiteId,
  });

  const { data: competitors, isLoading: loadingCompetitors } = useQuery({
    queryKey: ['seo', 'competitors', websiteId],
    queryFn: () => seoApi.getCompetitors(websiteId),
    enabled: !!websiteId,
  });

  const { data: opportunities, isLoading: loadingOpportunities } = useQuery({
    queryKey: ['seo', 'opportunities', websiteId],
    queryFn: () => seoApi.getContentOpportunities(websiteId),
    enabled: !!websiteId,
  });

  const { data: results, isLoading: loadingResults } = useQuery({
    queryKey: ['seo', 'results', websiteId],
    queryFn: () => seoApi.getResults(websiteId),
    enabled: !!websiteId,
  });

  // Mutations
  const createWebsiteMutation = useMutation({
    mutationFn: (data) => seoApi.createWebsite(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seo', 'websites']);
      toast.success('Website added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add website: ' + error.message);
    },
  });

  const runAuditMutation = useMutation({
    mutationFn: () => seoApi.runAudit(websiteId),
    onSuccess: () => {
      queryClient.invalidateQueries(['seo', 'audits', websiteId]);
      toast.success('SEO audit started');
    },
    onError: (error) => {
      toast.error('Failed to run audit: ' + error.message);
    },
  });

  const trackKeywordsMutation = useMutation({
    mutationFn: () => seoApi.trackKeywords(websiteId),
    onSuccess: () => {
      queryClient.invalidateQueries(['seo', 'keywords', websiteId]);
      toast.success('Keyword tracking updated');
    },
    onError: (error) => {
      toast.error('Failed to track keywords: ' + error.message);
    },
  });

  const analyzeCompetitorsMutation = useMutation({
    mutationFn: () => seoApi.analyzeCompetitors(websiteId),
    onSuccess: () => {
      queryClient.invalidateQueries(['seo', 'competitors', websiteId]);
      toast.success('Competitor analysis started');
    },
    onError: (error) => {
      toast.error('Failed to analyze competitors: ' + error.message);
    },
  });

  const generateBriefsMutation = useMutation({
    mutationFn: (topics) => seoApi.generateContentBriefs(websiteId, topics),
    onSuccess: () => {
      queryClient.invalidateQueries(['seo', 'opportunities', websiteId]);
      toast.success('Content briefs generated');
    },
    onError: (error) => {
      toast.error('Failed to generate briefs: ' + error.message);
    },
  });

  const applyFixesMutation = useMutation({
    mutationFn: (optimizationIds) => seoApi.applySEOFixes(websiteId, optimizationIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['seo', 'optimizations', websiteId]);
      queryClient.invalidateQueries(['seo', 'audits', websiteId]);
      toast.success('SEO fixes applied');
    },
    onError: (error) => {
      toast.error('Failed to apply fixes: ' + error.message);
    },
  });

  return {
    // Data
    websites,
    audits,
    keywords,
    competitors,
    opportunities,
    results,

    // Loading states
    loadingWebsites,
    loadingAudits,
    loadingKeywords,
    loadingCompetitors,
    loadingOpportunities,
    loadingResults,

    // Actions
    createWebsite: createWebsiteMutation.mutateAsync,
    runAudit: runAuditMutation.mutateAsync,
    trackKeywords: trackKeywordsMutation.mutateAsync,
    analyzeCompetitors: analyzeCompetitorsMutation.mutateAsync,
    generateBriefs: generateBriefsMutation.mutateAsync,
    applyFixes: applyFixesMutation.mutateAsync,
  };
}