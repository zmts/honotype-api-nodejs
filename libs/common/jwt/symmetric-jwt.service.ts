import { sign, verify, decode, Algorithm, JwtPayload, SignOptions, TokenExpiredError } from 'jsonwebtoken';

import { AppError, ErrorCode } from '@libs/common/errors';

type SighOptionsType = Omit<SignOptions, 'algorithm'> & { secret?: string };
type PayloadType = string | Buffer | object;

export class SymmetricJwtService {
  private readonly algorithm: Algorithm = 'HS512';

  constructor(private options?: SighOptionsType) {}

  sigh(payload: PayloadType, options?: SighOptionsType): string {
    const secret = options?.secret || this.options?.secret;
    if (!secret) {
      throw new Error(`${this.constructor.name}.sigh: secret is missing `);
    }

    const mergedOptions: SighOptionsType = { ...(this.options || {}), ...(options || {}) };
    delete mergedOptions.secret;

    return sign(payload, secret, { algorithm: this.algorithm, ...mergedOptions });
  }

  verify<T>(token: string, options?: Pick<SighOptionsType, 'secret'>): T & JwtPayload {
    const secret = options?.secret || this.options?.secret;
    if (!secret) {
      throw new Error(`${this.constructor.name}.verify: secret is missing `);
    }

    try {
      return verify(token, secret) as T;
    } catch (e) {
      if (e instanceof TokenExpiredError && e.name === 'TokenExpiredError') {
        throw new AppError(ErrorCode.TOKEN_VERIFY, { message: 'Token expired' });
      }
      throw new AppError(ErrorCode.TOKEN_VERIFY);
    }
  }

  decode<T>(token: string): T & JwtPayload {
    return decode(token) as T;
  }
}
