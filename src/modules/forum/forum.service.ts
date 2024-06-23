import { ConflictException, Injectable } from '@nestjs/common';
import { ObjectService } from '../object/object.service';
import { InjectModel } from '@nestjs/mongoose';
import { ActorDocument, ActorRecord } from '../object/schema/actor.schema';
import { Model } from 'mongoose';
import { ForumCreateDto } from '../object/dto/forum-create.dto';

export type ForumQueryOpts = {
  skip?: number;
  limit?: number;
}

@Injectable()
export class ForumService {
  constructor(
    protected readonly objectService: ObjectService,
    @InjectModel(ActorRecord.name) protected readonly actorModel: Model<ActorDocument>
  ) { }

  public async create(_domain: string, forumCreateDto: ForumCreateDto): Promise<ActorRecord> {
    const dto = {
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        'https://yuforium.org/ns/activitystreams'
      ],
      id: `https://${_domain}/forums/${forumCreateDto.pathId}`,
      preferredUsername: forumCreateDto.pathId,
      name: forumCreateDto.name,
      summary: forumCreateDto.summary,
      _domain,
      type: ['Service', 'Forum'],
      _public: true,
      _local: true
    };

    try {
      const forum = await this.actorModel.create(dto);
      return forum;
    }
    catch (e: any) {
      if (e.code === 11000) {
        throw new ConflictException(`Forum "${forumCreateDto.pathId}" already exists.`);
      }

      throw e;
    }
  }
}
