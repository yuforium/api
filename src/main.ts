import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // see below re: bodyParser
    logger: ['log', 'error', 'warn', 'debug', 'verbose']
  });

  // nest's built-in bodyParser is only configured to parse application/json, we need to create our own
  app.use(
    bodyParser.json({ type: ['application/activity+json', 'application/json'] })
  );

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

  const skipCors = true;

  if (process.env.NODE_ENV === 'development' || skipCors) {
    app.enableCors({ origin: '*' });
  } else {
    app.enableCors({
      origin: [
        `https://${process.env.DEFAULT_DOMAIN}`,
        `https://www.${process.env.DEFAULT_DOMAIN}`
      ]
    });
  }

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true
    })
  );

  await app.listen(parseInt(process.env.PORT || '3000', 10));
}
bootstrap();
