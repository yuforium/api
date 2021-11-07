import { Injectable, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityPubService } from '../activity-pub/activity-pub.service';
import { UserCreateDto } from './dto/user-create.dto';
import { User, UserDocument } from './schemas/user.schema';
import { DuplicateRecordException } from '../../common/exceptions/duplicate-record.exception';
import * as bcrypt from 'bcrypt';
import { Person, PersonDocument } from '../activity-pub/schema/person.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) protected userModel: Model<UserDocument>,
    @InjectModel(Person.name) protected personModel: Model<PersonDocument>,
    protected activityStreamService: ActivityPubService
  ) { }

  public async create(serviceId: string, userDto: UserCreateDto): Promise<any> {
    const saltRounds = 10;
    const {username, password} = userDto;
    const session = await this.userModel.db.startSession();

    session.startTransaction();

    try {
      const user = await this.userModel.create({username, password: await bcrypt.hash(password, saltRounds)});
      const userId = `${serviceId}/user/${username}`;
      const personData = {
        "@context": "https://www.w3.org/ns/activitystreams",
        'type': "Person",
        "id": `https://${serviceId}/user/${userDto.username}`,
        "name": userDto.name,
        "preferredUsername": user.username,
        "summary": userDto.summary,
      };
      // const actor = await this.activityStreamService.createActivity(actorData);

      const person = await this.personModel.create(personData);

      user.identities = [person._id];
      user.defaultIdentity = person._id;

      await user.save();

      session.commitTransaction();
      session.endSession();

      return person.toObject();
    }
    catch (error) {
      session.abortTransaction();
      session.endSession();

      if (error.code === 11000) {
        throw new DuplicateRecordException();
      }
      throw error;
    }
  }

  public async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({username});
  }

  public async findPerson(username: string): Promise<Person | undefined> {
    const user = await this.findOne(username);
    if (user) {
      console.log(user);
      return this.personModel.findOne({_id: user.defaultIdentity});
    }
    return Promise.resolve(undefined);
  }

  public async find(): Promise<any[]> {
    return this.userModel.find({});
  }
}
