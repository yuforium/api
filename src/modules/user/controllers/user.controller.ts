import { Body, Controller, Get, Header, Logger, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ObjectDocument } from 'src/modules/object/schema/object.schema';
import { ServiceDomain } from '../../../common/decorators/service-domain.decorator';
import { ObjectService } from '../../object/object.service';
import { PersonDto } from '../../../common/dto/object/person.dto';
import { UserCreateDto } from '../dto/user-create.dto';
import { UserService } from '../user.service';
import { UserParamsDto } from '../dto/user-params.dto';
import { Request } from 'express';
import { ActorDto } from '../../../common/dto/actor/actor.dto';

@ApiTags('user')
@Controller('users')
export class UserController {
  protected logger = new Logger(UserController.name);

  constructor(
    protected userService: UserService,
    protected objectService: ObjectService
  ) { }

  @ApiOperation({operationId: 'find'})
  @Get()
  @Header('Content-Type', 'application/activity+json')
  public async findUsers(@ServiceDomain() _serviceId: string): Promise<any[]> {
    const users = await this.objectService.find({_serviceId, type: 'Person'});
    return users.map((user: ObjectDocument) => plainToInstance(PersonDto, user));
  }

  @ApiOperation({operationId: 'exists'})
  @ApiParam({name: 'username', type: 'string', required: true, example: 'chris'})
  @Get('exists/:username')
  @Header('Content-Type', 'application/activity+json')
  public async userExists(@ServiceDomain() serviceId: string, @Param() params: UserParamsDto): Promise<boolean> {
    const person = await this.userService.findOne(serviceId, params.username.toLowerCase());

    if (person) {
      return true;
    }

    return false;
  }

  @ApiOperation({operationId: 'whoami'})
  @Get('whoami')
  @UseGuards(AuthGuard('jwt'))
  @Header('Content-Type', 'application/activity+json')
  public async whoAmI(@Req() req: any): Promise<any> {
    return req.user.actor;
  }

  @ApiOperation({operationId: 'create'})
  @Post()
  @Header('Content-Type', 'application/activity+json')
  public async create(@ServiceDomain() serviceId: string, @Body() userDto: UserCreateDto) {
    this.logger.debug(`Creating user ${userDto.username}`);
    userDto.username = userDto.username.toLowerCase();
    userDto.email = userDto.email.toLowerCase();

    return plainToInstance(PersonDto, await this.userService.create(serviceId, userDto));
  }

  @ApiOperation({operationId: 'get'})
  @ApiResponse({status: 404, type: PersonDto})
  @Get(':username')
  @Header('Content-Type', 'application/activity+json')
  public async findOne(@Req() req: Request, @ServiceDomain() domain: string, @Param('username') username: string): Promise<ActorDto> {
    const person = await this.userService.findPerson(domain, username.toLowerCase());
    if (person) {
      this.logger.debug(`Found user ${username}`);
      return person;
    }

    throw new NotFoundException('User does not exist');
  }

  // @Get(':username/content')
  // @Header('Content-Type', 'application/activity+json')
  // public async getUserContent(
  //   @ServiceId() serviceId: string,
  //   @Param('username') username: string,
  //   @Query('page') page: number = 0,
  //   @Query('pageSize') pageSize: number = 20,
  //   @Query('sort') sort: string = 'createdAt', // also by lastReply
  // ) {

  //   const collection = OrderedCollectionPage.factory({
  //     id: `https://${serviceId}/users/${username}/content`,
  //     first: `https://${serviceId}/users/${username}/content?page=0`,
  //     last: `https://${serviceId}/users/${username}/content?last=true`
  //   });

  //   return collection;
  // }

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
  //   return request.user;
  // }
}
