import { Injectable } from '@nestjs/common';
import { ForumCreateDto } from 'src/common/dto/forum-create.dto';
import { ObjectService } from '../object/object.service';

@Injectable()
export class ForumService {
  constructor(
    protected readonly objectService: ObjectService
  ) { }

  public async create(serviceId: string, forumCreateDto: ForumCreateDto) {
    const {activity} = await this.objectService.create(
      serviceId,
      `https://${serviceId}`,
      'forum',
      forumCreateDto,
      forumCreateDto.pathId
    );
    return activity.object;
  }
}
