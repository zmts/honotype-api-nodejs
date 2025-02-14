import { StringValue } from 'ms';
import { z } from 'zod';

import { ValidEnvConfig, Config } from '@libs/core';

export type AuthConfig = {
  accessToken: {
    secret: string;
    expiresIn: StringValue;
    issuer?: string;
  };
};

const config = new ValidEnvConfig({
  accessTokenSecret: { API_ACCESS_TOKEN_SECRET: z.string() },
  accessTokenExpiresIn: { API_ACCESS_EXP: z.string(), default: '1d' },
  accessIssuer: { API_ACCESS_ISSUER: z.string(), default: 'api-main' },
}).result();

export const authConfig = new Config<AuthConfig>({
  accessToken: {
    secret: config.accessTokenSecret,
    expiresIn: config.accessTokenExpiresIn as StringValue,
    issuer: config.accessIssuer,
  },
}).config();
