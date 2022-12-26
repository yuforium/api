import { Controller, Get, Header } from '@nestjs/common';

@Controller('.well-known/host-meta')
export class HostMetaController {
  @Get()
  @Header('Content-Type', 'application/xrd+xml')
  async getHostMeta() {
    return `<?xml version="1.0" encoding="UTF-8"?>
  <XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
    <Link rel="lrdd" template="http://mastodon.local:3000/.well-known/webfinger?resource={uri}"/>
  </XRD>`
  }
}
