import { Injectable } from '@nestjs/common';
import { ForumCreateDto } from 'src/common/dto/forum-create.dto';
import { ObjectService } from '../object/object.service';

@Injectable()
export class ForumService {
  constructor(
    protected readonly objectService: ObjectService
  ) { }

  public async create(_domain: string, forumCreateDto: ForumCreateDto) {
    const dto = {
      ...forumCreateDto, 
      _domain, 
      id: 'https://${_serviceId}/forum/${forumCreateDto.pathId}', 
      type: ['Service', 'Forum'],
      to: [],
      _public: true,
      _local: true
    };

    const forum = await this.objectService.create(dto);
  }
}
