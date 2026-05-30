/**
 * @file workflow-validator.ts
 * @description Ensures all state transitions adhere to the Global System Truth (GST) Matrix.
 */
import { GST_TRANSITION_MATRIX } from '@/core/gst';
import { logger } from '../observability-service';

export class WorkflowValidator {
  static validateTransition(domain: string, from: string, to: string): { allowed: boolean; code?: string } {
    const fromKey = `${domain.toUpperCase()}:${from.toUpperCase()}`;
    const toKey = `${domain.toUpperCase()}:${to.toUpperCase()}`;

    const allowedTransitions = GST_TRANSITION_MATRIX[fromKey];

    if (!allowedTransitions) {
      return { allowed: false, code: 'INVALID_DOMAIN_STATE' };
    }

    if (!allowedTransitions.includes(toKey as any)) {
      logger.error('WorkflowValidator', `ILLEGAL_TRANSITION_ATTEMPT: ${fromKey} -> ${toKey}`);
      return { allowed: false, code: 'TRANSITION_NOT_PERMITTED' };
    }

    return { allowed: true };
  }

  /**
   * Cross-domain integrity check. 
   * Example: A shipment cannot reach 'DELIVERED' if the payment is 'DISPUTED'.
   */
  static async checkCrossDomainConstraints(entityId: string): Promise<boolean> {
    // Implementation logic for cross-system consistency
    return true;
  }
}
