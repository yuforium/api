import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { UserCreateDto } from './dto/user-create.dto';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { ObjectService } from '../object/object.service';
import { MongoServerError } from 'mongodb';
import { generateKeyPairSync } from "crypto";
import { PersonDto } from 'src/common/dto/object/person.dto';
import { validate } from 'class-validator';
import { UserActorDocument, UserActorRecordDto } from './schemas/user-actor.schema';

@Injectable()
export class UserService {
  protected logger = new Logger(UserService.name);

  constructor(
    protected readonly objectService: ObjectService,
    @InjectModel(User.name) protected userModel: Model<UserDocument>,
    @InjectModel(UserActorRecordDto.name) protected userActorModel: Model<UserActorRecordDto>,
  ) { }

  public async create(_domain: string, userDto: UserCreateDto): Promise<any> {
    const saltRounds = 10;
    const {username, password} = userDto;

    if (password === undefined) {
      throw new Error('Password is required');
    }

    // @todo - consider if we should require an actual domain record to exist 
    // to allow for the creation of a user
    // const domain = await this.objectService.find({id: `https://${serviceId}`});

    // if (!domain || domain.type === 'Tombstone') {
    //   throw new BadRequestException('The serviceId provided is not valid.');
    // }

    try {
      const {publicKey, privateKey} = await this.generateUserKeyPair();

      const user = await this.userModel.create({
        domain: _domain,
        username,
        email: userDto.email,
        password: await bcrypt.hash(password, saltRounds),
        privateKey: privateKey.toString()
      });

      const _path = 'users';
      const _pathId = userDto.username;

      this.logger.debug(`Creating person object for user "${userDto.username}"`);
      const personDtoParams = {
        '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
        type: 'Person',
        id: `https://${_domain}/${_path}/${_pathId}`,
        attributedTo: `https://${_domain}/${_path}/${_pathId}`, // assume the user is creating themselves for now
        name: userDto.name,
        preferredUsername: user.username,
        summary: userDto.summary,
        _domain,
        to: [],
        _local: true,
        _public: true,
        _outbox: undefined,
        _inbox: [],
        _destination: [],
        publicKey: {
          id: `https://${_domain}/${_path}/${_pathId}#main-key`,
          owner: `https://${_domain}/${_path}/${_pathId}`,
          publicKeyPem: publicKey.toString()
        }
      };

      const personDto = Object.assign(new PersonDto(), personDtoParams);
      await validate(personDto);
      
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
  public async findOne(serviceDomain: string, username: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({domain: serviceDomain, username: {'$eq': username}});
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

/**
 * Reset a user's password
 * @param serviceId 
 * @param username 
 * @param hashedPassword bcrypt hashed password
 * @returns 
 */
public async resetPassword(serviceId: string, username: string, hashedPassword: string): Promise<string | undefined> {
  const user = await this.findOne(serviceId, username);

  if (!user) {
    this.logger.error(`User "${username}" not found`);
    return;
  }

  // const newPassword = Math.random().toString(36).slice(-8); // generate a random 8-character password
  // const hashedPassword = await bcrypt.hash(newPassword, 10); // hash the password using bcrypt

  user.password = hashedPassword;
  await user.save(); // save the updated user document

  return hashedPassword;
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

  public async findPersonById(_id: string | Schema.Types.ObjectId): Promise<UserActorDocument | null> {
    return this.userActorModel.findOne({_id, type: 'Person'});
  }
}
