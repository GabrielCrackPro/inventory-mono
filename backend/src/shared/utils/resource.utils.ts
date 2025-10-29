import { ForbiddenException, NotFoundException } from '../errors';

/**
 * Await a promise that may return null and throw NotFoundException with the provided message.
 */
export async function findOrThrow<T>(
  promise: Promise<T | null | undefined>,
  message = 'Not found',
  userId?: number,
): Promise<T> {
  const res = await promise;
  if (res === null || res === undefined)
    throw new NotFoundException(message, {
      userId,
    });
  return res as T;
}

/**
 * Ensure the given resource has an ownerId equal to userId, otherwise throw ForbiddenException.
 */
export function ensureOwner(resource: { ownerId?: number }, userId: number) {
  if (resource.ownerId !== userId) throw new ForbiddenException('Not allowed');
}
