import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ForumCreateDto } from 'src/common/dto/forum-create.dto';
import { ObjectService } from '../object/object.service';
import { InjectModel } from '@nestjs/mongoose';
import { ActorDocument, ActorRecord } from '../object/schema/actor.schema';
import { Model } from 'mongoose';
import { ObjectDocument, ObjectRecordDto } from '../object/schema/object.schema';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ForumService {
  constructor(
    protected readonly objectService: ObjectService,
    @InjectModel(ActorRecord.name) protected readonly actorModel: Model<ActorDocument>
  ) { }

  public async create(_domain: string, forumCreateDto: ForumCreateDto): Promise<ActorRecord> {
    const dto = {
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

  public async get(_domain: string, pathId: string): Promise<ActorDocument | null> {
    const forum = await this.actorModel.findOne({id: `https://${_domain}/forums/${pathId}`});
    return forum;
  }

  public async getContent(_domain: string, forumname: string): Promise<ObjectRecordDto[]> {
    const forum = await this.get(_domain, forumname);

    if (!forum) {
      throw new NotFoundException(`Forum "${forumname}" not found.`);
    }

    const posts = (await this.objectService.find({_destination: forum._id})).map((post: ObjectDocument) => plainToInstance(ObjectRecordDto, post));

    return posts;
  }
}
