import { AppError, ErrorCode } from '@libs/common/errors';
import { IFindOptions, IPageResult, SortDirection } from '@libs/core/types';

export abstract class BaseRepo {
  protected handleDbError(error: any): AppError {
    if (error?.code === '23505') {
      return new AppError(ErrorCode.CONFLICT, { message: error.detail || error.message });
    }

    if (error?.code === '23502') {
      return new AppError(ErrorCode.CONFLICT, { message: error.detail || error.message });
    }

    return new AppError(ErrorCode.DB, { message: error.message, origin: error });
  }

  protected errorEmptyResponse(): AppError {
    return new AppError(ErrorCode.NOT_FOUND);
  }

  protected emptyPageResponse<T>(): IPageResult<T> {
    return { items: [], pagination: { limit: 0, total: 0 } };
  }

  protected emptyListResponse<T>(): T[] {
    return [];
  }

  protected emptyObjectResponse<T extends object>(): T {
    return {} as T;
  }

  protected findOptions<T>(options: IFindOptions<T> = {}): IFindOptions<T> {
    return {
      filter: options.filter ?? {},
      relations: options.relations ?? {},
      sort: options.sort ?? ['id', SortDirection.ASC],
      pagination: {
        offset: options.pagination?.offset ?? 0,
        limit: options.pagination?.limit ?? 20,
      },
    };
  }

  protected getQueryTotal(item: Array<{ total: number }>): number {
    return item[0]?.total;
  }
}
