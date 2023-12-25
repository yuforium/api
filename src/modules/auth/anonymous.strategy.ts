import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class AnonymousStrategy extends PassportStrategy(Strategy, 'anonymous') {
  constructor() {
    super();
  }

  authenticate() {
    return this.success({
      username: null
    });
  }
}