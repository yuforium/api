import { Controller, Get, Query } from '@nestjs/common';
import { ServiceId } from 'src/common/decorators/service-id.decorator';
import { WebfingerService } from './webfinger.service';

@Controller('.well-known/webfinger')
export class WebfingerController {
  constructor(protected readonly webfingerService: WebfingerService) {}

  @Get()
  public async webfinger(@Query('resource') resource: string): Promise<any> {
    const [, username, serviceId] = /^acct:([A-Za-z0-9_]*)@(.*)$/i.exec(resource);
    const acct = this.webfingerService.getAccount(serviceId, username);

    return acct;
  }
}
