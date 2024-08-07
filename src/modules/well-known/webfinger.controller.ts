import { Controller, Get, Header, Logger, NotFoundException, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ServiceDomain } from '../../common/decorators/service-domain.decorator';
import { WebfingerDto } from './dto/webfinger.dto';
import { WebfingerService } from './webfinger.service';

@Controller('.well-known/webfinger')
export class WebfingerController {
  protected readonly logger = new Logger(WebfingerController.name);

  constructor(protected readonly webfingerService: WebfingerService) {}

  @Get()
  @Header('Content-Type', 'application/jrd+json')
  public async webfinger(@ServiceDomain() domain: string, @Query('resource') resource: string): Promise<WebfingerDto> {
    if (!resource) {
      this.logger.error('webfinger: no resource specified');
      throw new NotFoundException();
    }

    this.logger.debug(`webfinger: ${resource}`);
    const [, username, parsedServiceId] = /^acct:([\w_]*)@(.*)$/i.exec(resource) || [];

    if (!username || !parsedServiceId) {
      this.logger.error(`webfinger: invalid resource specified: ${resource}`);
      throw new NotFoundException();
    }

    if (parsedServiceId !== domain) {
      throw new NotFoundException();
    }

    const response = this.webfingerService.getAccount(domain, username);

    return plainToInstance(WebfingerDto, response);
  }
}
