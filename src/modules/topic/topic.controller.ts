import { Controller, Get } from '@nestjs/common';

@Controller('topic')
export class TopicController {
  @Get()
  public async get(): Promise<any> {
    return [];
  }
}
