import * as psl from 'psl';
import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";
import { ServiceId as ServiceIdType } from '../types/service-id.type';

const logger = new Logger('ServiceId');

export const ServiceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ServiceIdType => {
    const request = ctx.switchToHttp().getRequest();
    logger.debug(`Processing hostname ${request.hostname}`);
    // @todo this needs to be revisited
    let domain = psl.get(request.hostname);
    logger.debug(`Using domain ${domain} as serviceId`);

    if (typeof domain !== 'string') {
      throw new Error('not a valid name');
    }

    return domain;
  }
);