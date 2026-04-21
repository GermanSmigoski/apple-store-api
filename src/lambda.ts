import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedApp: any = null;

async function createApp(): Promise<any> {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:4173',
    ],
    methods: ['GET', 'POST'],
  });

  await app.init();
  cachedApp = app.getHttpAdapter().getInstance();
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  const expressApp = await createApp();
  return expressApp(req, res);
}
