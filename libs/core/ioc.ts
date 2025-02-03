export class Ioc {
  constructor(private readonly container: Map<symbol, any>) {}
  inject<T>(token: symbol): T {
    return this.container.get(token);
  }
}
