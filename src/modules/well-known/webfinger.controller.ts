import { BadRequestException, Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ServiceId } from 'src/common/decorators/service-id.decorator';
import { WebfingerService } from './webfinger.service';

@Controller('.well-known/webfinger')
export class WebfingerController {
  constructor(protected readonly webfingerService: WebfingerService) {}

  @Get()
  public async webfinger(@ServiceId() serviceId: string, @Query('resource') resource: string): Promise<any> {
    const [, username, parsedServiceId] = /^acct:([A-Za-z0-9_]*)@(.*)$/i.exec(resource) || [];

    if (!username || !parsedServiceId) {
      throw new NotFoundException();
    }

    const acct = this.webfingerService.getAccount(serviceId, username);

    return acct;
  }
}
