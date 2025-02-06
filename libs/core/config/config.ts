export class Config<T> {
  constructor(private readonly _config: T) {}
  config(): T {
    return this._config;
  }
}
