import 'reflect-metadata';
import './core/env';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app';
import { Errors } from './core/http';
async function main() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  app.setGlobalPrefix('v1');
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: process.env.WEB_ORIGIN || 'http://localhost:3000', credentials: true });
  app.useGlobalFilters(new Errors());
  app.enableShutdownHooks();
  await app.listen(Number(process.env.API_PORT || 4000), '0.0.0.0');
}
void main();
