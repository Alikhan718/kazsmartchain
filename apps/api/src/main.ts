import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 600,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('KazSmartChain Console API')
    .setDescription('Admin API for Besu/FireFly, IPFS, and Solana flows')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);

  const port = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 4000;
  const host = process.env.API_HOST || '0.0.0.0';
  await app.listen(port, host);
  // eslint-disable-next-line no-console
  console.log(`API listening at http://${host}:${port} (docs at /docs)`);
}

bootstrap();

