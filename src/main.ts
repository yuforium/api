import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose']
  });

  app.useBodyParser('json', {type: ['application/activity+json', 'application/json']});

  const options = new DocumentBuilder()
    .setTitle('Yuforium')
    .setDescription('Yuforium API specification')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, document);

  // see https://github.com/nestjs/nest/issues/528 - enables DI in class-validator dto objects
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  if (process.env.NODE_ENV === 'development') {
    app.enableCors({ origin: '*' });
  } else {
    app.enableCors({
      origin: [
        `https://${process.env.DEFAULT_DOMAIN}`,
        `https://www.${process.env.DEFAULT_DOMAIN}`
      ]
    });
  }

  app.useGlobalPipes(new ValidationPipe({transform: false, whitelist: true}));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {excludeExtraneousValues: true, exposeUnsetFields: false})
  );

  await app.listen(parseInt(process.env.PORT ?? '3000', 10));
}
bootstrap();
