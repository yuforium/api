import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';
import { MongooseModule } from "@nestjs/mongoose"
import { ForumsModule } from './forums/forums.module';

@Module({
  imports: [
	  MongooseModule.forRoot("mongodb://localhost/yuforium", {useNewUrlParser: true, useUnifiedTopology: true}),
	  ForumsModule
	],
  controllers: [AppController],
  providers:   [AppService],
})
export class AppModule {}
