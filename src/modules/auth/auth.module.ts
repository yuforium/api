import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ActivityPubModule } from '../activity-pub/activity-pub.module';
import { AnonymousStrategy } from './anonymous.strategy';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy, AnonymousStrategy],
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    ActivityPubModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('auth.jwtSecret'),
        signOptions: {expiresIn: '86400s'}
      })
    })
  ],
  controllers: [AuthController],
})
export class AuthModule {}
