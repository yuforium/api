import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { ValidationPipe } from '@nestjs/common'

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
  const fs = require("fs")

  // fs.writeFileSync("./swagger-spec.json", JSON.stringify(document))

  SwaggerModule.setup("api", app, document)

  app.enableCors({origin: "*"});

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
