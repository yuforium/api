import { ConflictException, Injectable, Logger, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { ActivityPubService } from '../activity-pub/activity-pub.service';
import { UserCreateDto } from './dto/user-create.dto';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { ObjectService } from '../object/object.service';
import { MongoServerError } from 'mongodb';
import { ObjectDto } from '../../common/dto/object/object.dto';
import { generateKeyPairSync } from "crypto";
import { PersonDto } from 'src/common/dto/object/person.dto';

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

  public async create(hostname: string, userDto: UserCreateDto): Promise<any> {
    const saltRounds = 10;
    const {username, password} = userDto;

    if (password === undefined) {
      throw new Error('Password is required');
    }

    try {
      const {publicKey, privateKey} = await this.generateUserKeyPair();

      const user = await this.userModel.create({
        hostname,
        username,
        email: userDto.email,
        password: await bcrypt.hash(password, saltRounds),
        privateKey: privateKey.toString()
      });

      const _path = 'users';
      const _pathId = userDto.username;

      const personDto = {
        '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
        type: 'Person',
        id: `https://${hostname}/${_path}/${_pathId}`,
        attributedTo: `https://${hostname}/${_path}/${_pathId}`, // assume the user is creating themselves for now
        name: userDto.name,
        preferredUsername: user.username,
        summary: userDto.summary,
        _hostname: hostname,
        '_path': 'users',
        '_pathId': _pathId,
        '_local': true,
        _public: true,
        'publicKey': {
          'id': `https://${hostname}/${_path}/${_pathId}#main-key`,
          'owner': `https://${hostname}/${_path}/${_pathId}`,
          'publicKeyPem': publicKey.toString()
        }
      };

      // effectively the person is creating themselves
      const {record} = await this.objectService.createActor(personDto);

      // @todo - a Create activity should be associated with the person object, attributed to the user, and to any other related information (such as IP address)

      user.identities = [record._id];
      user.defaultIdentity = record._id;

      await user.save();

      return record;
    } catch (e) {
      if (e instanceof MongoServerError) {
        if (e.code === 11000) {
          throw new ConflictException('Username already exists');
        }
      }

      throw e;
    }
  }

  /**
   * @todo this method is problematic, it shouldn't be limited to finding just by username and be more like the Mongoose findOne() method
   * @param serviceId 
   * @param username 
   * @returns 
   */
  public async findOne(serviceId: string, username: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({serviceId, username: {'$eq': username}});
  }

  public async findPerson(serviceId: string, username: string): Promise<any | undefined> {
    this.logger.debug(`findPerson "${username}"`);

    const user = await this.findOne(serviceId, username);

    if (user) {
      return this.objectService.findOne({_id: user.defaultIdentity});
    }

    return undefined;
  }

  public async find(): Promise<any[]> {
    return this.userModel.find({});
  }

  public async generateUserKeyPair(): Promise<any> {
    const {publicKey, privateKey} = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: ''
      }
    });

    return {publicKey, privateKey};
  }

  public async resetKey(serviceId: string, username: string): Promise<any> {
    const user = await this.findOne(serviceId, username);

    if (user) {
      const other = await this.objectService.findOne({_id: user.defaultIdentity});
    }

    if (!user) {
      this.logger.error(`User "${username}" not found`);
      return null;
    }

    const person = await this.objectService.findOne({_id: user.defaultIdentity});

    if (person) {
      person['@context'] = ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'];
      const {publicKey, privateKey} = await this.generateUserKeyPair();

      person.publicKey = {
        'id': `${person.id}#main-key`,
        'owner': person.id,
        'publicKeyPem': publicKey.toString()
      }

      user.privateKey = privateKey.toString();

      await person.save();
      await user.save();

      this.logger.log(`Reset key for user "${username}"`);
    }
    else {
      this.logger.error(`Default identity not found for user: ${username}`);
      return null;
    }
  }
}
