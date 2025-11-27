// orval.config.ts
import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    // 1. RUTA DE LA ESPECIFICACIÓN
    // Asegúrate de que el backend esté corriendo en localhost:8080
    input: 'http://localhost:8080/v3/api-docs',
    
    // 2. CONFIGURACIÓN DE SALIDA
    output: {
      target: './app/api/generated/syllabusApi.ts',
      
      client: 'react-query',
      
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
      schemas: './app/api/generated/model',
    },
  },
});