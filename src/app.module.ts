import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ForumModule } from './modules/forum/forum.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import database from './config/database';
import service from "./config/service";
import auth from './config/auth';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { InboxModule } from './modules/inbox/inbox.module';
import { SharedInboxModule } from './modules/shared-inbox/shared-inbox.module';
import { UserService } from './modules/user/user.service';
import { WellKnownModule } from './modules/well-known/well-known.module';
import { ActivityModule } from './modules/activity/activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({load: [database, service, auth]}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => config.get('database')
    }),
    AuthModule,
    UserModule,
    WellKnownModule,
    ActivityModule,
    InboxModule,
    SharedInboxModule,
    ForumModule,
  ],
  controllers: [AppController],
  providers:   [AppService],
})
export class AppModule {
  constructor() { }

  async onApplicationBootstrap() {
  }
}
