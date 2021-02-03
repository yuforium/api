import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose } from 'mongoose';
import { ActivityService } from '../activity/activity.service';
import { UserCreateDto } from './dto/user-create.dto';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) protected userModel: Model<UserDocument>, 
    protected activityService: ActivityService
  ) { }

  protected readonly users = [
    {
      userId: 1,
      username: 'superuser',
      password: process.env.SUPERUSER_PASSWORD
    }
  ];

  public async create(serviceId: string, userDto: UserCreateDto): Promise<User> {
    const saltRounds = 10;
    const {username, password} = userDto;
    const userId = `${serviceId}/user/${username}`;
    const record = {
      "@context": "https://www.w3.org/ns/activitystreams",
      'type': "Person",
      "id": `${serviceId}/user/${userDto.username}`,
      "name": userDto.name,
      "preferredUsername": userDto.username,
      "summary": userDto.summary,
      "inbox": `${userId}/inbox`,
      "outbox": `${userId}/outbox`,
      'followers': `${userId}/followers`,
      'following': `${userId}/following`,
      "liked": `${userId}/liked`,
      "password": await bcrypt.hash(password, saltRounds)
    };

    return Object.assign(new UserDto(), (await this.userModel.create(record)).toObject());
  }

  public async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({username});
  }

  public async find(): Promise<any> {
    return Promise.resolve(undefined);
  }
}
