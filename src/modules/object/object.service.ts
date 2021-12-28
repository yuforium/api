import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectDocument } from './schema/object.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class ObjectService {
  constructor(
    @InjectModel('Object') protected objectModel: Model<ObjectDocument>
  ) { }

  public async get(id: string): Promise<ObjectDocument> {
    return this.objectModel.findOne({id});
  }

  public async create(data): Promise<ObjectDocument> {
    const id = new mongoose.Types.ObjectId();
    data.id = 'https://yuforia.com/object/' + id;
    return this.objectModel.create(data);
  }

  public async getUserOutbox(userId: string): Promise<any> {
    return this.objectModel.find({attributedTo: userId});
  }
}
