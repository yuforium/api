import { createParamDecorator, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { parse } from 'tldts';

const logger = new Logger('ServiceDomainDecorator');

@Injectable()
export class ServiceDomainDecorator {
  static resolveDomain(hostname: string) {
    logger.debug(`Processing hostname ${hostname}`);
    const domain = parse(hostname);

    if (domain.hostname === 'localhost' && process.env.NODE_ENV === 'development') {
      return 'localhost';
    }

    if (domain.domain === null) {
      throw new Error('not a valid name');
    }

    logger.debug(`resolveDomain: Using domain ${domain.domain} as serviceDomain`);
    return domain.domain;
  }
}

export const ServiceDomain = createParamDecorator(
  (_, ctx: ExecutionContext): string => ServiceDomainDecorator.resolveDomain(ctx.switchToHttp().getRequest().hostname)
);

export const resolveDomain = ServiceDomainDecorator.resolveDomain;
