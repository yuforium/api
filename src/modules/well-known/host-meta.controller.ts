import { Controller, Get, Header, Logger } from '@nestjs/common';
import { ServiceDomain } from '../../common/decorators/service-domain.decorator';

@Controller('.well-known/host-meta')
export class HostMetaController {
  protected readonly logger = new Logger(HostMetaController.name);
  @Get()
  @Header('Content-Type', 'application/xrd+xml')
  async getHostMeta(@ServiceDomain() domain: string) {
    this.logger.debug(`host-meta: ${domain}`);
    return `<?xml version="1.0" encoding="UTF-8"?>
  <XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
    <Link rel="lrdd" template="https://${domain}/.well-known/webfinger?resource={uri}"/>
  </XRD>`;
  }
}
