export interface IRepository<Entity> {
  create?(data: Partial<Entity>): Promise<Entity>;
  createMany?(data: Partial<Entity>[]): Promise<void>;

  update?(entity: Partial<Entity>): Promise<Entity>;
  updateMany?(entity: Partial<Entity>[]): Promise<void>;

  findAll?(options?: { [key: string]: any }): Promise<Entity[]>;
  findOneById?(id: number, options?: { [key: string]: any }): Promise<Entity | null>;
  findOneByUuid?(uuid: string, options?: { [key: string]: any }): Promise<Entity | null>;

  delete?(id: number): Promise<boolean>;
  deleteWhere?(id: number): Promise<void>;
}

export interface IPageResult<T> {
  items: T[];
  pagination: {
    total: number;
    limit?: number;
  };
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface IFindOptions<Entity> {
  filter?: Partial<Entity>;
  sort?: [string, SortDirection];
  relations?: { [key in keyof Entity]?: boolean };
  pagination?: IPagination;
}

export interface IPagination {
  offset?: number;
  limit?: number;
}
