declare module '@paddle/paddle-node-sdk' {
  export enum Environment {
    sandbox = 'sandbox',
    production = 'production'
  }

  export enum LogLevel {
    error = 'error',
    warn = 'warn',
    info = 'info',
    http = 'http',
    verbose = 'verbose',
    debug = 'debug',
    silly = 'silly'
  }

  export interface PaddleSDKOptions {
    apiKey: string;
    environment: Environment;
    logLevel?: LogLevel;
  }

  export class PaddleSDK {
    constructor(options: PaddleSDKOptions);
    webhooks: {
      unmarshal: (rawBody: string, privateKey: string, signature: string) => any;
    };
  }
}