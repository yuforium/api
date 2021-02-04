import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityStreamService } from '../activity-stream/activity-stream.service';
import { UserCreateDto } from './dto/user-create.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) protected userModel: Model<UserDocument>, 
    protected activityStreamService: ActivityStreamService
  ) { }

  public async create(serviceId: string, userDto: UserCreateDto): Promise<UserDto> {
    const saltRounds = 10;
    const {username, password} = userDto;
    const user = await this.userModel.create({username, password});
    const userId = `${serviceId}/user/${username}`;
    const actor = {
      "@context": "https://www.w3.org/ns/activitystreams",
      'type': "Person",
      "id": `${serviceId}/user/${userDto.username}`,
      "name": userDto.name,
      "preferredUsername": userDto.username,
      "summary": userDto.summary,
    };

    this.activityStreamService.createActivity(actor)
    
    return;
    // const record = {
    //   "@context": "https://www.w3.org/ns/activitystreams",
    //   'type': "Person",
    //   "id": `${serviceId}/user/${userDto.username}`,
    //   "name": userDto.name,
    //   "preferredUsername": userDto.username,
    //   "summary": userDto.summary,
    //   "inbox": `${userId}/inbox`,
    //   "outbox": `${userId}/outbox`,
    //   'followers': `${userId}/followers`,
    //   'following': `${userId}/following`,
    //   "liked": `${userId}/liked`,
    //   "password": await bcrypt.hash(password, saltRounds)
    // };
    // const user = await this.userModel.create(record);
    // const response = Object.assign(new UserDto(), user.toObject());

    // const activity = await this.activityService.create({
    //   "@context": "https://www.w3.org/ns/activitystreams",
    //   "type": "Create",
    //   "id": user.id,
    //   "actor": serviceId,
    //   "object": user._id
    // });

    // return response;
  }

  public async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({username});
  }

  public async find(): Promise<any> {
    return Promise.resolve(undefined);
  }
}
