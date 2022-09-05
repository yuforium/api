import { Body, Controller, Get, HttpCode, HttpStatus, Logger, NotImplementedException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Note } from '@yuforium/activity-streams-validator';
import { plainToClass } from 'class-transformer';
import { ServiceId } from '../../../common/decorators/service-id.decorator';
import { ObjectService } from 'src/modules/object/object.service';
import { ActivityService } from '../../activity/services/activity.service';
import { Request } from 'express';
import { ObjectDocument } from 'src/modules/object/schema/object.schema';

@ApiTags('user')
@Controller('user/:username/inbox')
export class UserInboxController {
  protected logger = new Logger(UserInboxController.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService
  ) { }

  @ApiBearerAuth()
  @ApiOperation({operationId: 'getInbox'})
  @ApiParam({name: 'username', required: true, type: String, 'description': 'The username of the user to get the inbox for.'})
  @Get()
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  public async getInbox(@Req() req: Request, @ServiceId() serviceId: string, @Param() params: any) {
    const queryParams = {to: `https://${serviceId}/user/${params.username}`};
    const content = await this.objectService.find(queryParams);
    const response = content.map((item: ObjectDocument) => plainToClass(Note, item, {excludeExtraneousValues: true}));

    return response;
  }

  // this should send a 202 accepted since the result will be queued
  @ApiBearerAuth() // @todo is this necessary? a token can be passed to authenticate the user but it's completely optional (could be used to bypass rate limiting)
  @ApiOperation({operationId: 'postInbox'})
  @ApiParam({name: 'username', required: true, type: String, 'description': 'The username of the user to get the inbox for.'})
  @Post()
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @HttpCode(HttpStatus.ACCEPTED)
  public async postInbox(@Req() req: Request, @Body() activity: any, @Param('username') username: string) {
    // this.logger.debug(`Received "${activity.type}" activity from ${req.connection.remoteAddress}`);
    // const receipt = await this.activityService.process(activity);
    // return {
    //   status: 'accepted',
    //   message: 'The activity was queued for processing.',
    //   receipt
    // }

  }
}
