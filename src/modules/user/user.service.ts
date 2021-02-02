import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) protected userModel: Model<UserDocument>) { }

  protected readonly users = [
    {
      userId: 1,
      username: 'superuser',
      password: process.env.SUPERUSER_PASSWORD
    }
  ];

  public async create(serviceId: string, userDto: any): Promise<User> {
    const {username} = userDto;
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
      "liked": `${userId}/liked`
    };
    
    return this.userModel.create(userDto);
  }

  public async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({username});
  }

  public async find(): Promise<any> {
    return Promise.resolve(undefined);
  }
}
