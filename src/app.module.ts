import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import database from './config/database';
import service from "./config/service";
import auth from './config/auth';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { WellKnownModule } from './modules/well-known/well-known.module';
import { ActivityPubModule } from './modules/activity-pub/activity-pub.module';
import { ActivityModule } from './modules/activity/activity.module';
import { ForumModule } from './modules/forum/forum.module';

@Module({
  imports: [
    ConfigModule.forRoot({load: [database, service, auth], isGlobal: true}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => config.get('database') as MongooseModuleFactoryOptions
    }),
    AuthModule,
    UserModule,
    WellKnownModule,
    ActivityPubModule,
    ActivityModule,
    ForumModule
    // ObjectModule
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
  exports: [ConfigService]
})
export class AppModule {
  constructor() { }

  async onApplicationBootstrap() {
  }
}
