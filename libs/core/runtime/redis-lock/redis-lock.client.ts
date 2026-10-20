import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import type { RedisClientType } from 'redis';

import type { LockResult } from './types';

const RELEASE_LOCK_SCRIPT = `
  if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
  end
  return 0
`;

export class RedisLockClient {
  constructor(
    private readonly redis: Pick<RedisClientType, 'set' | 'eval'>,
    private readonly keyPrefix = 'lock',
    private readonly commandTimeoutMs = 5_000,
  ) {
    if (keyPrefix.trim().length === 0) {
      throw new TypeError('Lock key prefix must not be empty');
    }

    if (!Number.isSafeInteger(commandTimeoutMs) || commandTimeoutMs <= 0 || commandTimeoutMs > 2_147_483_647) {
      throw new RangeError('commandTimeoutMs must be an integer between 1 and 2147483647');
    }
  }

  /** The TTL does not stop the callback or guarantee ownership until it completes. */
  async withLock<T>(key: string, ttlMs: number, callback: () => Promise<T>): Promise<LockResult<T>> {
    if (key.trim().length === 0) {
      throw new TypeError('Lock key must not be empty');
    }

    if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) {
      throw new RangeError('ttlMs must be a positive safe integer');
    }

    const lockKey = `${this.keyPrefix}:${key}`;
    const token = randomUUID();
    const startedAtMs = performance.now();
    const acquired = await this.runCommand(
      this.redis.set(lockKey, token, { condition: 'NX', expiration: { type: 'PX', value: ttlMs } }),
    );

    if (acquired !== 'OK') {
      return { executed: false };
    }

    try {
      // A delayed SET response may arrive after the lease has already expired.
      if (performance.now() - startedAtMs >= ttlMs) {
        throw new Error('Redis lock expired before the callback could start');
      }

      const value = await callback();
      return { executed: true, value };
    } finally {
      try {
        await this.runCommand(this.redis.eval(RELEASE_LOCK_SCRIPT, { keys: [lockKey], arguments: [token] }));
      } catch (error) {
        // Cleanup failure must not replace the callback result or its original error.
        console.error('Failed to release Redis lock', { lockKey, error });
      }
    }
  }

  private async runCommand<T>(command: Promise<T>): Promise<T> {
    // A timeout bounds waiting; an already sent Redis command may still take effect.
    const { promise: deadline, reject } = Promise.withResolvers<never>();
    const timer = setTimeout(() => reject(new Error('Redis lock command timed out')), this.commandTimeoutMs);

    try {
      return await Promise.race([command, deadline]);
    } finally {
      clearTimeout(timer);
    }
  }
}
