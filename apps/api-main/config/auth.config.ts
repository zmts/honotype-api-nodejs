import { StringValue } from 'ms';
import { z } from 'zod';

import { ValidEnvConfig, Config } from '@libs/core';

const config = new ValidEnvConfig({
  accessTokenSecret: { API_ACCESS_TOKEN_SECRET: z.string() },
  accessTokenExpiresIn: { API_ACCESS_EXP: z.string(), default: '1d' },
  accessIssuer: { API_ACCESS_ISSUER: z.string(), default: 'api-main' },
  googleClientId: { GOOGLE_CLIENT_ID: z.string() },
  googleClientSecret: { GOOGLE_CLIENT_SECRET: z.string() },
  frontRedirectURL: { GOOGLE_AUTH_FRONT_REDIRECT_URL: z.url() },
}).result();

const configData = {
  refreshToken: {
    expiresIn: '7d' as StringValue,
  },
  accessToken: {
    secret: config.accessTokenSecret,
    expiresIn: config.accessTokenExpiresIn as StringValue,
    issuer: config.accessIssuer,
  },
  google: {
    clientId: config.googleClientId,
    clientSecret: config.googleClientSecret,
    frontRedirectURL: config.frontRedirectURL,
  },
};

export type AuthConfigType = typeof configData;
export const authConfig = new Config<AuthConfigType>(configData).config();
