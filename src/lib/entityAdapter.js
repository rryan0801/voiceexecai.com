/**
 * Entity Adapter - Abstract your custom entities
 * 
 * This layer allows VoiceExec to work with YOUR entity schema
 * without modifying VoiceExec code.
 */

import { base44 } from '@/api/base44Client';
import portabilityConfig from '@/config/portabilityConfig';

const { entities: entityNames, fieldMapping } = portabilityConfig;

/**
 * Generic entity operations that work with your custom entities
 */
export class EntityAdapter {
  /**
   * Get a prospect by ID
   */
  static async getProspect(id) {
    const entity = base44.entities[entityNames.prospect];
    const prospect = await entity.get(id);
    return this.mapProspectFromDB(prospect);
  }

  /**
   * List prospects with filtering
   */
  static async listProspects(filter = {}, sort = '-updated_date', limit = 100) {
    const entity = base44.entities[entityNames.prospect];
    const prospects = await entity.filter(filter, sort, limit);
    return prospects.map(p => this.mapProspectFromDB(p));
  }

  /**
   * Create a prospect
   */
  static async createProspect(data) {
    const entity = base44.entities[entityNames.prospect];
    const mapped = this.mapProspectToDB(data);
    return await entity.create(mapped);
  }

  /**
   * Update a prospect
   */
  static async updateProspect(id, data) {
    const entity = base44.entities[entityNames.prospect];
    const mapped = this.mapProspectToDB(data);
    return await entity.update(id, mapped);
  }

  /**
   * Get a deal by ID
   */
  static async getDeal(id) {
    const entity = base44.entities[entityNames.deal];
    const deal = await entity.get(id);
    return this.mapDealFromDB(deal);
  }

  /**
   * List deals with filtering
   */
  static async listDeals(filter = {}, sort = '-updated_date', limit = 100) {
    const entity = base44.entities[entityNames.deal];
    const deals = await entity.filter(filter, sort, limit);
    return deals.map(d => this.mapDealFromDB(d));
  }

  /**
   * Create a deal
   */
  static async createDeal(data) {
    const entity = base44.entities[entityNames.deal];
    const mapped = this.mapDealToDB(data);
    return await entity.create(mapped);
  }

  /**
   * Update a deal
   */
  static async updateDeal(id, data) {
    const entity = base44.entities[entityNames.deal];
    const mapped = this.mapDealToDB(data);
    return await entity.update(id, mapped);
  }

  /**
   * Get interactions for a prospect
   */
  static async getProspectInteractions(prospectId, limit = 50) {
    const entity = base44.entities[entityNames.interaction];
    return await entity.filter({ prospect_id: prospectId }, '-created_date', limit);
  }

  /**
   * Record an interaction
   */
  static async recordInteraction(prospectId, interactionData) {
    const entity = base44.entities[entityNames.interaction];
    return await entity.create({
      prospect_id: prospectId,
      ...interactionData
    });
  }

  /**
   * Get client by ID
   */
  static async getClient(id) {
    const entity = base44.entities[entityNames.client];
    return await entity.get(id);
  }

  /**
   * List clients
   */
  static async listClients(filter = {}, sort = '-updated_date', limit = 50) {
    const entity = base44.entities[entityNames.client];
    return await entity.filter(filter, sort, limit);
  }

  // ============= MAPPING HELPERS =============

  /**
   * Map prospect from database format to app format
   */
  static mapProspectFromDB(dbProspect) {
    return {
      id: dbProspect.id,
      name: dbProspect[fieldMapping.prospectName] || '',
      email: dbProspect[fieldMapping.prospectEmail] || '',
      phone: dbProspect[fieldMapping.prospectPhone] || '',
      company: dbProspect[fieldMapping.company] || '',
      ...dbProspect // Include all other fields
    };
  }

  /**
   * Map prospect to database format
   */
  static mapProspectToDB(appProspect) {
    return {
      [fieldMapping.prospectName]: appProspect.name || appProspect.prospect_name,
      [fieldMapping.prospectEmail]: appProspect.email,
      [fieldMapping.prospectPhone]: appProspect.phone,
      [fieldMapping.company]: appProspect.company || appProspect.company_name,
      ...appProspect
    };
  }

  /**
   * Map deal from database format to app format
   */
  static mapDealFromDB(dbDeal) {
    return {
      id: dbDeal.id,
      value: dbDeal[fieldMapping.dealValue] || 0,
      stage: dbDeal[fieldMapping.dealStage] || 'prospecting',
      probability: dbDeal[fieldMapping.winProbability] || 0,
      ...dbDeal
    };
  }

  /**
   * Map deal to database format
   */
  static mapDealToDB(appDeal) {
    return {
      [fieldMapping.dealValue]: appDeal.value,
      [fieldMapping.dealStage]: appDeal.stage,
      [fieldMapping.winProbability]: appDeal.probability,
      ...appDeal
    };
  }
}

export default EntityAdapter;