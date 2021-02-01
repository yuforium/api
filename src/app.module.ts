import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { ForumModule } from './modules/forum/forum.module';
import { ConfigModule } from '@nestjs/config';
import service from "./config/service";
import auth from './config/auth';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { InboxModule } from './modules/inbox/inbox.module';
import { SharedInboxModule } from './modules/shared-inbox/shared-inbox.module';
import { DomainModule } from './modules/domain/domain.module';

@Module({
  imports: [
    ConfigModule.forRoot({load: [service, auth]}),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    // TypegooseModule.forRoot(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true}),
    DomainModule,
    InboxModule,
    SharedInboxModule,
    AuthModule,
    UserModule,
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
