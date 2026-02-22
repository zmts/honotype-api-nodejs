import { UserId } from '@libs/common/types/global';
import { uuid7 } from '@libs/common/utils';

import { BaseEntity } from './base.entity';

interface IRefreshSession {
  id: number;
  userId: UserId;
  refreshToken: string;
  ua: string | null;
  fingerprint?: string | null;
  ip?: string | null;
  expiresIn: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshSession extends IRefreshSession {}
export class RefreshSession extends BaseEntity<Partial<IRefreshSession>> {
  constructor(props: Partial<IRefreshSession>) {
    super(props);
    this.refreshToken = uuid7();
  }
}
