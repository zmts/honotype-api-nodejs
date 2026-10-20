import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['{apps,libs}/**/__tests__/**/*.test.ts'],
  },
});
