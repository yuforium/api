// @todo switch to parse-domain package, it should be faster since it uses a trie to match the domain
// @todo consider renaming `serviceId` to `serviceDomain`
import * as psl from 'psl';
import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";
import { ServiceDomain as ServiceDomainType } from '../types/service-domain.type';
import { parse } from 'tldts';

const logger = new Logger('ServiceId');

export const ServiceDomain = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ServiceDomainType => {
    const request = ctx.switchToHttp().getRequest();
    logger.debug(`Processing hostname ${request.hostname}`);
    // @todo this needs to be revisited
    let domain = parse(request.hostname);

    if (domain.domain === null) {
      throw new Error('not a valid name');
    }

    logger.debug(`Using domain ${domain.domain} as serviceDomain`);
    return domain.domain;
  }
);