import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  apiUrl: 'http://curseando-backend-prod.eba-ttmuudmn.us-east-1.elasticbeanstalk.com/api/v1',
  locale: 'es-AR',
  toast: {
    timeout: 4000
  }
};
