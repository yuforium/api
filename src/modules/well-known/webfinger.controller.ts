import { Controller, Get, Logger, NotFoundException, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ServiceDomain } from '../../common/decorators/service-domain.decorator';
import { WebfingerDto } from './dto/webfinger.dto';
import { WebfingerService } from './webfinger.service';

@Controller('.well-known/webfinger')
export class WebfingerController {
  protected readonly logger = new Logger(WebfingerController.name);

  constructor(protected readonly webfingerService: WebfingerService) {}

  @Get()
  public async webfinger(@ServiceDomain() domain: string, @Query('resource') resource: string): Promise<WebfingerDto> {
    this.logger.debug(`webfinger: ${resource}`);
    const [, username, parsedServiceId] = /^acct:([A-Za-z0-9_]*)@(.*)$/i.exec(resource) || [];

    if (!username || !parsedServiceId) {
      throw new NotFoundException();
    }

    const response = this.webfingerService.getAccount(domain, username);

    return plainToInstance(WebfingerDto, response);
  }
}
