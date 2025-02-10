export interface IRepository<Entity> {
  create?(data: Partial<Entity>): Promise<Entity>;
  createMany?(data: Partial<Entity>[]): Promise<void>;

  update?(entity: Partial<Entity>): Promise<Entity>;
  updateMany?(entity: Partial<Entity>[]): Promise<void>;

  find?(options?: { [key: string]: any }): Promise<Entity[]>;
  findById?(id: number, options?: { [key: string]: any }): Promise<Entity | null>;
  findByUuid?(uuid: string, options?: { [key: string]: any }): Promise<Entity | null>;

  delete?(id: number): Promise<boolean>;
  deleteWhere?(id: number): Promise<void>;
}
