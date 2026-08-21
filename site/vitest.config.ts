import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Um arquivo de teste por vez. Com o paralelismo padrão (um worker por
    // arquivo) a suíte trava por contenção nesta máquina — o ledger do
    // projeto registrou isso duas vezes e o comando que funcionava
    // (`--no-file-parallelism`) só vivia lá. Fixado aqui para `npm test`
    // terminar em qualquer clone/CI (review final, I1).
    fileParallelism: false,
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
