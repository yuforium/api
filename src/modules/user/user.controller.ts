import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ServiceId } from '../../common/decorators/service-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserCreateDto } from './dto/user-create.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(protected userService: UserService) { }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  public create(@ServiceId() serviceId: string, @Body() userDto: UserCreateDto) {
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
  public postOutbox(@Param('username') username: string, @Body() body: any) {
    return body;
  }
}
