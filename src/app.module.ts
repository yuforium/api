import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { ForumModule } from './modules/forum/forum.module';
import { ConfigModule } from '@nestjs/config';
import service from "./config/service";

@Module({
	imports: [
		ConfigModule.forRoot({load: [service]}),
		TypegooseModule.forRoot(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true}),
		ForumModule
	],
  controllers: [AppController],
  providers:   [AppService],
})
export class AppModule {

	// onApplicationBootstrap ()
	// {
	// }
}
