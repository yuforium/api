import * as psl from 'psl';
import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";

const logger = new Logger('ServiceId');

export const ServiceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    logger.debug(`Processing hostname ${request.hostname}`);
    const domain = psl.get(request.hostname) || psl.get(process.env.DEFAULT_DOMAIN);
    logger.debug(`Using domain ${domain} as serviceId`);

    if (typeof domain !== 'string') {
      throw new Error('not a valid name');
    }

    return domain;
  }
);