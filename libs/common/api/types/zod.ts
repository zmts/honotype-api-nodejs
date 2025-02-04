import { z, ZodType } from 'zod';

export function zodSchema<T extends { [key: string]: any }>(schema: ZodFrom<T>): ZodType {
  return z.object(schema);
}

type ZodFrom<T extends { [key: string]: any }> = {
  [key in keyof T]: ZodType<T[key]>;
};
