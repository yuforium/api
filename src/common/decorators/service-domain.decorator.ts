// @todo switch to parse-domain package, it should be faster since it uses a trie to match the domain
// @todo consider renaming `serviceId` to `serviceDomain`

import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";
import { ServiceDomain as ServiceDomainType } from '../types/service-domain.type';
import { parse } from 'tldts';

const logger = new Logger('ServiceId');

export const ServiceDomain = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ServiceDomainType => {
    const request = ctx.switchToHttp().getRequest();
    
    return resolveDomain(request.hostname);
  }
);

export function resolveDomain(hostname: string) {
  logger.debug(`Processing hostname ${hostname}`);
  let domain = parse(hostname);

  if (domain.hostname === 'localhost' && process.env.NODE_ENV === 'development') {
    return 'localhost';
  }

  if (domain.domain === null) {
    throw new Error('not a valid name');
  }

  logger.debug(`resolveDomain: Using domain ${domain.domain} as serviceDomain`);
  return domain.domain;
}