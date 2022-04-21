import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "./auth.service";
import * as psl from 'psl';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(protected authService: AuthService) {
    super({passReqToCallback: true});
  }

  public async validate(req: any, username: string, password: string) {
    const serviceId = psl.get(req.hostname) || psl.get(process.env.DEFAULT_DOMAIN);
    const user = await this.authService.validateUser(serviceId, username, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}