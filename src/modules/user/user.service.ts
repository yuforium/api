import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { generateKeyPairSync } from 'crypto';
import { MongoServerError } from 'mongodb';
import { Model, Schema } from 'mongoose';
import { ActorDto } from '../../common/dto/actor/actor.dto';
import { ObjectService } from '../object/object.service';
import { ActorDocument } from '../object/schema/actor.schema';
import { PersonDocument } from '../object/schema/person.schema';
import { UserActorDocument, UserActorRecord } from '../object/schema/user-actor.schema';
import { UserCreateDto } from './dto/user-create.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  protected logger = new Logger(UserService.name);

  constructor(
    protected readonly objectService: ObjectService,
    @InjectModel(User.name) protected userModel: Model<UserDocument>,
    @InjectModel(UserActorRecord.name) protected userActorModel: Model<UserActorDocument>,
  ) { }

  public async create(domain: string, userDto: UserCreateDto): Promise<any> {
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
        domain: domain,
        username,
        email: userDto.email,
        password: await bcrypt.hash(password, saltRounds),
        privateKey: privateKey.toString()
      });

      const _path = 'users';
      const _pathId = userDto.username;

      this.logger.debug(`Creating person object for user "${userDto.username}"`);

      const id = `https://${domain}/${_path}/${_pathId}`;
      const personDtoParams: UserActorRecord = {
        '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
        type: 'Person',
        id: id,
        attributedTo: id, // assume the user is creating themselves for now
        outbox: `${id}/outbox`,
        inbox: `${id}/inbox`,
        following: `${id}/following`,
        followers: `${id}/followers`,
        name: userDto.name || user.username,
        preferredUsername: user.username,
        // summary: userDto.summary,
        _domain: domain,
        _local: true,
        _public: true,
        publicKey: {
          id: `https://${domain}/${_path}/${_pathId}#main-key`,
          owner: `https://${domain}/${_path}/${_pathId}`,
          publicKeyPem: publicKey.toString()
        }
      };

      // effectively the person is creating themselves
      const record = await this.userActorModel.create(personDtoParams);

      // @todo - a Create activity should be associated with the person object, attributed to the user, and to any other related information (such as IP address)

      user.identities = [record._id];
      user.defaultIdentity = record._id;

      await user.save();

      return record;
    }
    catch (e) {
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

  public async findPerson(_domain: string, username: string): Promise<ActorDto | undefined> {
    this.logger.debug(`findPerson "${username}" at domain "${_domain}"`);

    const person = await this.userActorModel.findOne({
      id: `https://${_domain}/users/${username}`,
      type: 'Person',
      preferredUsername: username
    });

    return plainToInstance(ActorDto, person);

    // const user = await this.findOne(serviceId, username);

    // if (user) {
    //   return this.objectService.findOne({_id: user.defaultIdentity});
    // }

    // return undefined;
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
  public async resetPassword(domain: string, username: string, hashedPassword: string): Promise<string | undefined> {
    const user = await this.findOne(domain, username);

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

  /**
   * Reset a user's key pair
   */
  public async resetKey(serviceId: string, username: string): Promise<any> {
    const user = await this.findOne(serviceId, username);

    if (!user) {
      this.logger.error(`User "${username}" not found`);
      return null;
    }

    const person = await this.objectService.findByInternalId(user.defaultIdentity) as PersonDocument;

    if (person) {
      person['@context'] = ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'];
      const {publicKey, privateKey} = await this.generateUserKeyPair();

      person.publicKey = {
        'id': `${person.id}#main-key`,
        'owner': person.id,
        'publicKeyPem': publicKey.toString()
      };

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

  public async findPersonById(_id: string | Schema.Types.ObjectId): Promise<ActorDocument | null> {
    return this.userActorModel.findOne({_id, type: 'Person'});
  }
}
