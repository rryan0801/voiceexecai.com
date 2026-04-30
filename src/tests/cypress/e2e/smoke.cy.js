/* eslint-disable no-undef */
describe('VoiceExec AI - Cypress Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Dashboard loads successfully', () => {
    cy.contains('Dashboard').should('be.visible');
    cy.get('nav').should('exist');
  });

  it('Can navigate to Deals page', () => {
    cy.get('a[href="/deals"]').click();
    cy.url().should('include', '/deals');
    cy.contains('Deal Intelligence').should('be.visible');
  });

  it('Can navigate to Conversations page', () => {
    cy.get('a[href="/conversations"]').click();
    cy.url().should('include', '/conversations');
    cy.contains('Conversation Analytics').should('be.visible');
  });

  it('Can navigate to Meeting Prep page', () => {
    cy.get('a[href="/meeting-prep"]').click();
    cy.url().should('include', '/meeting-prep');
    cy.contains('Meeting Copilot').should('be.visible');
  });

  it('Can navigate to Playbooks page', () => {
    cy.get('a[href="/playbooks"]').click();
    cy.url().should('include', '/playbooks');
    cy.contains('Sales Playbooks').should('be.visible');
  });

  it('Can navigate to Analytics page', () => {
    cy.get('a[href="/analytics"]').click();
    cy.url().should('include', '/analytics');
    cy.contains('Analytics').should('be.visible');
  });

  it('Can navigate to Commands page', () => {
    cy.get('a[href="/commands"]').click();
    cy.url().should('include', '/commands');
    cy.contains('Voice Commands').should('be.visible');
  });

  it('Can navigate to Prospects page', () => {
    cy.get('a[href="/prospects"]').click();
    cy.url().should('include', '/prospects');
    cy.contains('Prospect Database').should('be.visible');
  });

  it('Can navigate to Team page', () => {
    cy.get('a[href="/team"]').click();
    cy.url().should('include', '/team');
    cy.contains('Team Performance').should('be.visible');
  });

  it('Can navigate to AutoPilot page', () => {
    cy.get('a[href="/autopilot"]').click();
    cy.url().should('include', '/autopilot');
    cy.contains('AutoPilot').should('be.visible');
  });

  it('Can navigate to Mobile view', () => {
    cy.get('a[href="/mobile"]').click();
    cy.url().should('include', '/mobile');
  });

  it('Dashboard displays KPI cards', () => {
    cy.get('[class*="card"]').should('have.length.greaterThan', 2);
  });

  it('All page links in navbar work', () => {
    const pages = ['/deals', '/conversations', '/meeting-prep', '/playbooks', '/analytics'];
    
    pages.forEach(page => {
      cy.get(`a[href="${page}"]`).should('exist');
    });
  });

  it('Can interact with Deal Intelligence cards', () => {
    cy.visit('/deals');
    cy.get('[class*="card"]').first().should('exist');
  });

  it('Meeting Copilot search input exists', () => {
    cy.visit('/meeting-prep');
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });

  it('Playbooks page has create button', () => {
    cy.visit('/playbooks');
    cy.contains('button', 'New Playbook').should('be.visible');
  });
});

describe('Navigation Flow', () => {
  it('Can navigate through multiple pages in sequence', () => {
    cy.visit('/');
    cy.contains('Dashboard').should('be.visible');

    cy.get('a[href="/deals"]').click();
    cy.contains('Deal Intelligence').should('be.visible');

    cy.get('a[href="/conversations"]').click();
    cy.contains('Conversation Analytics').should('be.visible');

    cy.get('a[href="/meeting-prep"]').click();
    cy.contains('Meeting Copilot').should('be.visible');

    cy.get('a[href="/playbooks"]').click();
    cy.contains('Sales Playbooks').should('be.visible');
  });
});