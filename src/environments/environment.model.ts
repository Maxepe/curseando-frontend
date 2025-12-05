/**
 * Environment configuration interface
 * Ensures consistency across all environment files (development, production, etc.)
 */
export interface Environment {
  production: boolean;
  apiUrl: string;
  locale: string;
  toast: {
    timeout: number;  // Toast auto-dismiss timeout in milliseconds
  };
}
