// @todo switch to parse-domain package, it should be faster since it uses a trie to match the domain
// @todo consider renaming `serviceId` to `serviceDomain`
import * as psl from 'psl';
import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";
import { ServiceId as ServiceIdType } from '../types/service-id.type';

const logger = new Logger('ServiceId');

export const ServiceDomain = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ServiceIdType => {
    const request = ctx.switchToHttp().getRequest();
    logger.debug(`Processing hostname ${request.hostname}`);
    // @todo this needs to be revisited
    console.time('psl.get');
    let domain = psl.get(request.hostname);
    console.timeEnd('psl.get');
    logger.debug(`Using domain ${domain} as serviceId`);

    if (typeof domain !== 'string') {
      throw new Error('not a valid name');
    }

    return domain;
  }
);