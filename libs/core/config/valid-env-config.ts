import dotenv from 'dotenv';
import { z, ZodType } from 'zod';

dotenv.config();

export class ValidEnvConfig<T extends Record<string, any>> {
  private config: Partial<T> = {};

  constructor(schema: { [K in keyof T]: { [envVar: string]: ZodType<T[K]> } | { default?: T[K] } }) {
    for (const [key, envMapping] of Object.entries(schema)) {
      const [[envName, validator]] = Object.entries(envMapping);

      const envValue = process.env[envName];
      const defaultValue = envMapping.default;

      if (envValue === undefined && defaultValue === undefined) {
        throw new Error(`Missing required "${envName}" environment variable`);
      }

      let target: any = envValue;
      if (envValue !== undefined) {
        if (validator instanceof z.ZodNumber) target = Number(envValue);
        if (validator instanceof z.ZodBoolean) target = Boolean(envValue);
      } else {
        target = defaultValue;
      }

      const { success, data, error } = (validator as ZodType).safeParse(target);
      if (!success) {
        throw new Error(`Invalid "${envName}" environment variable: ${error}`);
      }

      this.config[key as keyof T] = data;
    }
  }

  result(): T {
    return this.config as T;
  }
}
