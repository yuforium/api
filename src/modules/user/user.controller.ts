import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Req, Res, UnauthorizedException, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { DuplicateRecordFilter } from '../../common/decorators/duplicate-record-filter.decorator';
import { ServiceId } from '../../common/decorators/service-id.decorator';
import { ActivityPubService } from '../activity-pub/activity-pub.service';
import { Person } from '../activity-pub/schema/person.schema';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserCreateDto } from './dto/user-create.dto';
import { UserService } from './user.service';

@Controller('user')
// @UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    protected userService: UserService,
    protected activityPubService: ActivityPubService
  ) {
  }

  @Get()
  public async findUsers(): Promise<any[]> {
    return await this.userService.find();
  }

  // @UseFilters(DuplicateRecordFilter)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  public async create(@ServiceId() serviceId: string, @Body() userDto: UserCreateDto) {
    return this.userService.create(serviceId, userDto);
  }

  @Get(':username')
  public async findOne(@Param('username') username: string) {
    const person = await this.userService.findPerson(username);

    return person;
  }

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard)
  @Get(':username/inbox')
  public getInbox(@Param('username') username: string) {
    return 'getInbox';
  }

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard)
  @Post(':username/outbox')
  public async postOutbox(@ServiceId() serviceId: string, @Req() request: Request, @Param('username') username: string, @Body() body: any) {
    if ((request.user as any).id !== `${serviceId}/user/${username}`) {
      throw new UnauthorizedException();
    }

    // const message = await this.activityPubService.createObject(body);
    // const activity = await this.activityPubService.createActivity({
    //   type: 'Create',
    //   object: message._id
    // });

    // return message.toObject();

    return request.user;
  }
}
