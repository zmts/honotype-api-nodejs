import { z, ZodType } from 'zod';

export const zodSchema = <T extends Record<string, any>>(schema: {
  [K in keyof T]: ZodType<T[K]>;
}): ZodType => {
  return z.object(schema).strict();
};
