import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  locale: 'es-AR',
  toast: {
    timeout: 3000
  }
};
