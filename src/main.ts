import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { GlobalExceptionFilter } from './global/global-expection.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as requestIp from 'request-ip';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('hbs');

  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Access-Control-Allow-Origin header enable
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    // res.header('X-Frame-Options','SAMEORIGIN');
    next();
  });

  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(json({ limit: '10mb' }));

  const config = new DocumentBuilder()
    .setTitle(' Capicu')
    .setDescription('Capicu Game API')
    .addBearerAuth(
      {
        in: 'Header',
        scheme: 'Bearer',
        name: 'Authorization',
        type: 'http',
        bearerFormat: 'JWT',
      },
      'accessToken',
    )
    .build();
    app.use(requestIp.mw());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3002, () => {
    console.log(
      `Listening on port 3002`,
    );
  });
}
bootstrap();
