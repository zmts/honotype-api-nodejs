export type LockResult<T> = { executed: false } | { executed: true; value: T };
