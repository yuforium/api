import { BadRequestException, Controller, Get, Logger, NotFoundException, Query } from '@nestjs/common';
import { ServiceId } from '../../common/decorators/service-id.decorator';
import { WebfingerService } from './webfinger.service';

@Controller('.well-known/webfinger')
export class WebfingerController {
  protected readonly logger = new Logger(WebfingerController.name);

  constructor(protected readonly webfingerService: WebfingerService) {}

  @Get()
  public async webfinger(@ServiceId() serviceId: string, @Query('resource') resource: string): Promise<any> {
    const [, username, parsedServiceId] = /^acct:([A-Za-z0-9_]*)@(.*)$/i.exec(resource) || [];

    console.log(`username is ${username} and serviceId is ${parsedServiceId}`);
    if (!username || !parsedServiceId) {
      throw new NotFoundException();
    }

    const acct = this.webfingerService.getAccount(serviceId, username);

    return acct;
  }
}
