import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'


async function bootstrap () 
{
	const 
		app = await NestFactory.create(AppModule),

		options = new DocumentBuilder()
			.setTitle("Yuforium API Specification")
			.setDescription("Yuforium API specification")
			.setVersion("1.0")
			.build(),

		document = SwaggerModule.createDocument(app, options),
		fs       = require("fs")

	// fs.writeFileSync("./swagger-spec.json", JSON.stringify(document))

	SwaggerModule.setup("api", app, document)

	app.enableCors({origin: "*"})

	await app.listen(3000);
}
bootstrap();
