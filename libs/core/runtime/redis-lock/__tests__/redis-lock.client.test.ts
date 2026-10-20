import { performance } from 'node:perf_hooks';

import { createClient } from 'redis';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { RedisLockClient } from '../redis-lock.client';

type LockRedis = ConstructorParameters<typeof RedisLockClient>[0];

function setup(commandTimeoutMs = 5_000): {
  locks: RedisLockClient;
  set: MockInstance<LockRedis['set']>;
  release: MockInstance<LockRedis['eval']>;
  log: MockInstance<typeof console.error>;
} {
  const redis = createClient();
  const set = vi.spyOn(redis, 'set').mockResolvedValue('OK');
  const release = vi.spyOn(redis, 'eval').mockResolvedValue(1);
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const locks = new RedisLockClient(redis, 'test:lock', commandTimeoutMs);

  return { locks, set, release, log };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('RedisLockClient', () => {
  it('returns the callback result, including null, and releases the lock', async () => {
    const { locks, release } = setup();

    await expect(locks.withLock('order:1', 10_000, async (): Promise<null> => null)).resolves.toEqual({
      executed: true,
      value: null,
    });
    expect(release).toHaveBeenCalledOnce();
  });

  it('does not execute the callback when the lock is busy', async () => {
    const { locks, set, release } = setup();
    set.mockResolvedValue(null);
    const callback = vi.fn();

    await expect(locks.withLock('order:1', 10_000, callback)).resolves.toEqual({ executed: false });
    expect(callback).not.toHaveBeenCalled();
    expect(release).not.toHaveBeenCalled();
  });

  it('propagates acquisition errors without executing the callback', async () => {
    const { locks, set, release } = setup();
    const error = new Error('Redis unavailable');
    set.mockRejectedValue(error);
    const callback = vi.fn();

    await expect(locks.withLock('order:1', 10_000, callback)).rejects.toBe(error);
    expect(callback).not.toHaveBeenCalled();
    expect(release).not.toHaveBeenCalled();
  });

  it('releases the lock and preserves the callback error', async () => {
    const { locks, release } = setup();
    const error = new Error('Order update failed');
    const callback = vi.fn().mockRejectedValue(error);

    await expect(locks.withLock('order:1', 10_000, callback)).rejects.toBe(error);
    expect(release).toHaveBeenCalledOnce();
  });

  it('logs cleanup failure without replacing a successful callback result', async () => {
    const { locks, release, log } = setup();
    const error = new Error('Connection lost');
    release.mockRejectedValue(error);

    await expect(locks.withLock('order:1', 10_000, async () => 42)).resolves.toEqual({ executed: true, value: 42 });
    expect(log).toHaveBeenCalledWith('Failed to release Redis lock', { lockKey: 'test:lock:order:1', error });
  });

  it('preserves the original callback error when cleanup also fails', async () => {
    const { locks, release, log } = setup();
    const error = new Error('Order update failed');
    release.mockRejectedValue(new Error('Connection lost'));

    await expect(locks.withLock('order:1', 10_000, vi.fn().mockRejectedValue(error))).rejects.toBe(error);
    expect(log).toHaveBeenCalledOnce();
  });

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid TTL %s', async ttlMs => {
    const { locks, set } = setup();
    const callback = vi.fn();

    await expect(locks.withLock('order:1', ttlMs, callback)).rejects.toThrow(RangeError);
    expect(set).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it('rejects empty keys before contacting Redis', async () => {
    const { locks, set } = setup();

    await expect(locks.withLock('  ', 10_000, vi.fn())).rejects.toThrow(TypeError);
    expect(set).not.toHaveBeenCalled();
  });

  it('does not start the callback if the lease expired while awaiting SET', async () => {
    const { locks, release } = setup();
    vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(10_000);
    const callback = vi.fn();

    await expect(locks.withLock('order:1', 10_000, callback)).rejects.toThrow('expired');
    expect(callback).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledOnce();
  });

  it('bounds acquisition waiting and never runs the callback after a late reply', async () => {
    vi.useFakeTimers();
    const { locks, set } = setup(100);
    const pendingSet = Promise.withResolvers<'OK'>();
    set.mockReturnValue(pendingSet.promise);
    const callback = vi.fn();
    const operation = locks.withLock('order:1', 10_000, callback);
    const assertion = expect(operation).rejects.toThrow('timed out');

    await vi.advanceTimersByTimeAsync(100);
    await assertion;
    pendingSet.resolve('OK');
    await Promise.resolve();

    expect(callback).not.toHaveBeenCalled();
  });

  it('bounds cleanup waiting without losing the callback result', async () => {
    vi.useFakeTimers();
    const { locks, release, log } = setup(100);
    const pendingRelease = Promise.withResolvers<number>();
    release.mockReturnValue(pendingRelease.promise);
    const operation = locks.withLock('order:1', 10_000, async () => 42);

    await vi.advanceTimersByTimeAsync(100);

    await expect(operation).resolves.toEqual({ executed: true, value: 42 });
    expect(log).toHaveBeenCalledOnce();
    pendingRelease.reject(new Error('Late Redis failure'));
    await Promise.resolve();
  });
});
