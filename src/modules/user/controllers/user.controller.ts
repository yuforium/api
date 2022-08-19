import { Body, ClassSerializerInterceptor, Controller, Get, Header, NotFoundException, Param, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ObjectDocument } from 'src/modules/object/schema/object.schema';
import { ServiceId } from '../../../common/decorators/service-id.decorator';
import { ObjectService } from '../../object/object.service';
import { PersonDto } from '../dto/person.dto';
import { UserCreateDto } from '../dto/user-create.dto';
import { UserService } from '../user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    protected userService: UserService,
    protected objectService: ObjectService
  ) { }

  @ApiOperation({operationId: 'find'})
  @Get()
  @Header('Content-Type', 'application/activity+json')
  public async findUsers(@ServiceId() _serviceId: string): Promise<any[]> {
    const users = await this.objectService.find({_serviceId, type: 'Person'});
    return users.map((user: ObjectDocument) => plainToInstance(PersonDto, user));
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
  public async create(@ServiceId() serviceId: string, @Body() userDto: UserCreateDto) {
    return plainToInstance(PersonDto, await this.userService.create(serviceId, userDto));
  }

  @ApiOperation({operationId: 'get'})
  @ApiResponse({status: 404, type: PersonDto})
  @Get(':username')
  @Header('Content-Type', 'application/activity+json')
  public async findOne(@ServiceId() serviceId: string, @Param('username') username: string): Promise<PersonDto> {
    const person = await this.userService.findPerson(serviceId, username);

    if (person) {
      return plainToInstance(PersonDto, person);
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
  //   console.log(request.user);
  //   return request.user;
  // }
}
