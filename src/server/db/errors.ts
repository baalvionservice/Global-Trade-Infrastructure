/**
 * @file server/db/errors.ts
 * @description Typed persistence errors surfaced by the repository layer.
 */

export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity}_NOT_FOUND: ${id}`);
    this.name = 'NotFoundError';
  }
}

/** Raised when an optimistic-locked update loses the version race. */
export class OptimisticLockError extends Error {
  constructor(entity: string, id: string, expectedVersion: number) {
    super(`OPTIMISTIC_LOCK_CONFLICT: ${entity} ${id} is not at version ${expectedVersion}`);
    this.name = 'OptimisticLockError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
