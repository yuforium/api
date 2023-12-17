import { ClassSerializerInterceptor, Controller, Get, Param, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { ServiceDomain } from '../../common/decorators/service-domain.decorator';
import { ObjectService } from './object.service';

@Controller('object')
// @UseInterceptors(ClassSerializerInterceptor)
// @SerializeOptions({excludeExtraneousValues: true})
export class ObjectController {
  constructor(protected readonly objectService: ObjectService) { }

  @Get(':id')
  public async get(@ServiceDomain() serviceId: string, @Param('id') id: string): Promise<any> {
    id = `https://${serviceId}/object/${id}`;
    return this.objectService.get(id);
  }
}
