import { Body, ClassSerializerInterceptor, Controller, Get, Header, NotFoundException, Param, Post, Query, Req, Res, UnauthorizedException, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { OrderedCollectionPage } from '@yuforium/activity-streams-validator';
import { classToPlain, plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { DuplicateRecordFilter } from '../../common/decorators/duplicate-record-filter.decorator';
import { ServiceId } from '../../common/decorators/service-id.decorator';
import { ActivityPubService } from '../activity-pub/activity-pub.service';
import { Person } from '../activity-pub/schema/person.schema';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PersonDto } from './dto/person.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { UserService } from './user.service';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    protected userService: UserService,
    protected activityPubService: ActivityPubService
  ) {
  }

  @Get()
  @Header('Content-Type', 'application/activity+json')
  public async findUsers(): Promise<any[]> {
    const users = await this.activityPubService.findPerson();
    return users.map(user => plainToClass(PersonDto, user));
  }

  @Post()
  @Header('Content-Type', 'application/activity+json')
  public async create(@ServiceId() serviceId: string, @Body() userDto: UserCreateDto) {
    return this.userService.create(serviceId, userDto);
  }

  @Get(':username')
  @Header('Content-Type', 'application/activity+json')
  public async findOne(@ServiceId() serviceId: string, @Param('username') username: string) {
    const person = await this.userService.findPerson(username);

    if (person) {
      return plainToClass(PersonDto, person);
    }

    throw new NotFoundException('User does not exist');
  }


  @Get(':username/content')
  @Header('Content-Type', 'application/activity+json')
  public async getUserContent(
    @ServiceId() serviceId: string,
    @Param('username') username: string,
    @Query('page') page: number = 0,
    @Query('pageSize') pageSize: number = 20,
    @Query('sort') sort: string = 'createdAt', // also by lastReply
  ) {

    const collection = OrderedCollectionPage.factory({
      id: `https://${serviceId}/users/${username}/content`,
      first: `https://${serviceId}/users/${username}/content?page=0`,
      last: `https://${serviceId}/users/${username}/content?last=true`
    });

    return collection;
  }

  // @Roles(Role.User)
  // @UseGuards(JwtAuthGuard)
  // @Get(':username/inbox')
  // public getInbox(@Param('username') username: string) {
  //   return 'getInbox';
  // }

  // @Roles(Role.User)
  // @UseGuards(JwtAuthGuard)
  // @Post(':username/outbox')
  // public async postOutbox(@ServiceId() serviceId: string, @Req() request: Request, @Param('username') username: string, @Body() body: any) {
  //   if ((request.user as any).id !== `${serviceId}/user/${username}`) {
  //     throw new UnauthorizedException();
  //   }

    // const message = await this.activityPubService.createObject(body);
    // const activity = await this.activityPubService.createActivity({
    //   type: 'Create',
    //   object: message._id
    // });

    // return message.toObject();
  //   console.log(request.user);
  //   return request.user;
  // }
}
