// orval.config.ts
import { defineConfig } from 'orval';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default defineConfig({
  // --- CLIENT (React Query + Axios) ---
  clientApi: {
    input: `${API_URL}/v3/api-docs`,
    output: {
      target: './app/api/generated/client.ts',
      client: 'react-query',
      schemas: './app/api/generated/model',
      override: {
        mutator: {
          path: './app/api/custom-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          useSuspenseQuery: true,
        },
      },
    },
  },
});
