import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { Forum } from '../models/forum.model';
import { ModelType } from '@typegoose/typegoose/lib/types';

@Injectable()
export class ForumService {
  constructor(@InjectModel(Forum) protected readonly forumModel: ModelType<Forum>) { }

  async create(forum: Forum): Promise<Forum> {
    const createdForum = new this.forumModel(forum);
    return createdForum.save();
  }

  async get(id: string): Promise<Forum> {
    return this.forumModel.findOne({id}).then(data => JSON.parse(JSON.stringify(data)));
  }

  async find(): Promise<Forum[]> {
    return this.forumModel.find({}).then(data => JSON.parse(JSON.stringify(data)));
  }

  async delete(id: string) {
    return this.forumModel.deleteOne(id);
  }
}
