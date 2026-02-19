import { z } from 'zod';

export const schema = {
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(32)
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/),
};
