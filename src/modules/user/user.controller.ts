import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Req, Res, UnauthorizedException, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { DuplicateRecordFilter } from '../../common/decorators/duplicate-record-filter.decorator';
import { ServiceId } from '../../common/decorators/service-id.decorator';
import { ActivityPubService } from '../activity-pub/activity-pub.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserCreateDto } from './dto/user-create.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    protected userService: UserService,
    protected activityPubService: ActivityPubService
  ) { }

  @UseFilters(DuplicateRecordFilter)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  public async create(@ServiceId() serviceId: string, @Body() userDto: UserCreateDto) {
    return this.userService.create(serviceId, userDto);
  }

  @Get()
  public find() {
    return this.userService.find();
  }

  @Get(':username')
  public findOne(@Param('username') username: string) {
    return this.userService.findOne(username);
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

    const message = await this.activityPubService.createObject(body);
    // const activity = await this.activityPubService.createActivity({
    //   type: 'Create',
    //   object: message._id
    // });

    return message.toObject();

    return request.user;
  }
}
