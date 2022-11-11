import { ConflictException, Injectable, Logger, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { ActivityPubService } from '../activity-pub/activity-pub.service';
import { UserCreateDto } from './dto/user-create.dto';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { ObjectService } from '../object/object.service';
import { MongoServerError } from 'mongodb';
import { ObjectDto } from '../object/dto/object.dto';

// import { Person, PersonDocument } from '../activity-pub/schema/person.schema';

@Injectable()
export class UserService {
  protected logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) protected userModel: Model<UserDocument>,
    protected readonly objectService: ObjectService
    // @InjectModel(Person.name) protected personModel: Model<PersonDocument>,
    // protected activityStreamService: ActivityPubService
  ) { }

  public async create(serviceId: string, userDto: UserCreateDto): Promise<any> {
    const saltRounds = 10;
    const {username, password} = userDto;

    if (password === undefined) {
      throw new Error('Password is required');
    }

    const user = await this.userModel.create({serviceId, username, password: await bcrypt.hash(password, saltRounds)});
    const personDto = {
      "@context": "https://www.w3.org/ns/activitystreams",
      'type': "Person",
      "id": `https://${serviceId}/user/${userDto.username}`,
      "name": userDto.name,
      "preferredUsername": user.username,
      "summary": userDto.summary,
      '_serviceId': serviceId
    };

    const person = await this.objectService.create(personDto);

    // @todo - a Create activity should be associated with the person object, attributed to the user, and to any other related information (such as IP address)

    user.identities = [person._id];
    user.defaultIdentity = person._id;

    await user.save();

    return person;
  }

  public async findOne(serviceId: string, username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({serviceId, username});
  }

  public async findPerson(serviceId: string, username: string): Promise<any | undefined> {
    this.logger.debug(`findPerson "${username}"`);

    const user = await this.findOne(serviceId, username);

    if (user) {
      return this.objectService.findOne({_id: user.defaultIdentity});
    }

    return Promise.resolve(undefined);
  }

  public async find(): Promise<any[]> {
    return this.userModel.find({});
  }
}
