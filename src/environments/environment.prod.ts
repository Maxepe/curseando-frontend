import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api/v1',  // TODO: Update with production API URL
  locale: 'es-AR',
  toast: {
    timeout: 4000
  }
};
