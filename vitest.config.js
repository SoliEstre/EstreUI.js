import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./test/estreui/setup.js'],
        include: ['test/**/*.test.js'],
    },
});
