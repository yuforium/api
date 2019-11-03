import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"


async function bootstrap () 
{
	const app = await NestFactory.create(AppModule);

	const 
		options = new DocumentBuilder()
			.setTitle("Yuforium API Specification")
			.setDescription("Yuforium API specification")
			.setVersion("1.0")
			.build(),

		document = SwaggerModule.createDocument(app, options)

	SwaggerModule.setup("api", app, document)

	await app.listen(3000);
}
bootstrap();
