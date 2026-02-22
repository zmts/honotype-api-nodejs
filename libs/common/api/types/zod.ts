import { z, ZodType } from 'zod';

export const zodSchema = <T extends object>(schema: {
  [K in keyof T]: ZodType<T[K]>;
}): ZodType<T> => {
  return z.object(schema).strict() as unknown as ZodType<T>;
};
