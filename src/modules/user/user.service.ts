import { Injectable, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityStreamService } from '../activity-stream/activity-stream.service';
import { UserCreateDto } from './dto/user-create.dto';
import { User, UserDocument } from './schemas/user.schema';
import { DuplicateRecordException } from '../../common/exceptions/duplicate-record.exception';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) protected userModel: Model<UserDocument>, 
    protected activityStreamService: ActivityStreamService
  ) { }

  public async create(serviceId: string, userDto: UserCreateDto): Promise<any> {
    const saltRounds = 10;
    const {username, password} = userDto;
    const session = await this.userModel.db.startSession();

    session.startTransaction();

    try {
      const user = await this.userModel.create({username, password: await bcrypt.hash(password, saltRounds)});
      const userId = `${serviceId}/user/${username}`;
      const actorData = {
        "@context": "https://www.w3.org/ns/activitystreams",
        'type': "Person",
        "id": `${serviceId}/user/${userDto.username}`,
        "name": userDto.name,
        "preferredUsername": user.username,
        "summary": userDto.summary,
      };
      const actor = await this.activityStreamService.createActivity(actorData);

      user.identities = [actor._id];
      user.defaultIdentity = actor._id;
      
      await user.save();

      session.commitTransaction();
      session.endSession();
      
      return actor.toObject();
    } 
    catch (error) {
      session.abortTransaction();
      session.endSession();

      if (error.code === 11000) {
        throw new DuplicateRecordException("record exists");
      }
      throw error;
    }
  }

  public async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({username});
  }

  public async find(): Promise<any> {
    return Promise.resolve(undefined);
  }
}
