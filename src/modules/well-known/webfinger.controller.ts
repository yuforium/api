import { Controller, Get, Query } from '@nestjs/common';

@Controller('.well-known/webfinger')
export class WebfingerController {
  @Get()
  public async webfinger(@Query('resource') resource: string) {
    const username = /^acct:([A-Za-z0-9_]*)@yuforium.com$/i.exec(resource);
    return {username, resource};
  }
}
