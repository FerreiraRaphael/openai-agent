import { defineConfig } from 'orval';

export default defineConfig({
  agent: {
    input: 'http://localhost:3000/api-json',
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/model',
      client: 'react-query',
      override: {
        query: {
          useQuery: true,
          useInfinite: false,
        },
        mutator: {
          path: './src/api/axios-client.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
