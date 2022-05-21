import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { useContainer } from 'class-validator'

async function bootstrap () {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose']
  });

  const options = new DocumentBuilder()
    .setTitle("Yuforium API Specification")
    .setDescription("Yuforium API specification")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup("api", app, document)

  // see https://github.com/nestjs/nest/issues/528 - enables DI in class-validator dto objects
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors({origin: "*"});
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector), {excludeExtraneousValues: true}));

  await app.listen(3000);
}
bootstrap();
