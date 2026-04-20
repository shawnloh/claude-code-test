import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/Users/shawn/dev-workspace/claude-code/max-course',
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
