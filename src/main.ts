import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as crypto from 'node:crypto';

(global as any).crypto = crypto;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'https://cloudnest-pratikthaiba.netlify.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
