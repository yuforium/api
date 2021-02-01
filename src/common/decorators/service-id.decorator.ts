import * as psl from 'psl';
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const ServiceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const domain = psl.get(request.hostname) || psl.get(process.env.DEFAULT_DOMAIN);

    if (typeof domain !== 'string') {
      throw new Error('not a valid name');
    }

    return `https://${domain}`;
  }
);