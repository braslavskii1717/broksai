import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const candidates = [
  path.resolve(__dirname, './openapi.yaml'),
  path.resolve(__dirname, '../src/docs/openapi.yaml'),
];

export const openApiSpecPath = candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
export const swaggerDocument = YAML.load(openApiSpecPath);

export const swaggerOptions = {
  customCss:
    '.swagger-ui .topbar { display: none; } .swagger-ui .info h1 { font-weight: 600; } .swagger-ui .scheme-container { background: #0f172a; color: #f8fafc; }',
  customSiteTitle: 'BroksAI API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
    docExpansion: 'none',
  },
};

export { swaggerUi };
