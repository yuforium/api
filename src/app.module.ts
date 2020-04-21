import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';
import { TypegooseModule } from "nestjs-typegoose"
import { MongooseModule } from "@nestjs/mongoose"
import { ForumsModule } from './forums/forums.module'
import { ServiceModule } from './service/service.module'
import { ConfigModule } from "@nestjs/config"
import service from "./config/service"

console.log(process.env.MONGODB_URI)

@Module({
	imports: [
		ConfigModule.forRoot({load: [service]}),
		TypegooseModule.forRoot(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true}),
		MongooseModule.forRoot(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true}),
		ForumsModule,
		ServiceModule
	],
  controllers: [AppController],
  providers:   [AppService],
})
export class AppModule
{
	// onApplicationBootstrap ()
	// {
	// }
}
