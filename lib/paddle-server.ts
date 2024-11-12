import { Environment, LogLevel, PaddleSDK } from '@paddle/paddle-node-sdk';

const environment = process.env.PADDLE_ENVIRONMENT === Environment.sandbox 
  ? Environment.sandbox 
  : Environment.production;

const apiKey = environment === Environment.sandbox 
  ? process.env.PADDLE_SANDBOX_API_KEY
  : process.env.PADDLE_PRODUCTION_API_KEY;

if (!apiKey) {
  console.error('Paddle API key is missing');
}

export function getPaddleInstance() {
  return new PaddleSDK({
    apiKey: apiKey || '',
    environment,
    logLevel: LogLevel.error,
  });
}