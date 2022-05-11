import { Body, Controller, Get, HttpCode, HttpStatus, Logger, NotImplementedException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Note } from '@yuforium/activity-streams-validator';
import { plainToClass } from 'class-transformer';
import { ServiceId } from 'src/common/decorators/service-id.decorator';
import { NoteDto } from 'src/common/dto/note.dto';
import { ObjectService } from 'src/modules/object/object.service';
import { ActivityService } from '../../activity/services/activity.service';

@ApiTags('user')
@Controller('user/:username/inbox')
export class InboxController {
  protected logger = new Logger(InboxController.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService
  ) { }

  @ApiBearerAuth()
  @ApiOperation({operationId: 'getInbox'})
  @ApiParam({name: 'username', required: true, type: String, 'description': 'The username of the user to get the inbox for.'})
  @Get()
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  public async getInbox(@Req() req, @ServiceId() serviceId: string, @Param() params: any) {
    const queryParams = {to: `https://${serviceId}/user/${params.username}`};
    const content = await this.objectService.find(queryParams);

    const response = content.map(item => plainToClass(Note, item, {excludeExtraneousValues: true}));


    return response;
  }

  // this should send a 202 accepted since the result will be queued
  @ApiBearerAuth()
  @ApiOperation({operationId: 'postInbox'})
  @ApiParam({name: 'username', required: true, type: String, 'description': 'The username of the user to get the inbox for.'})
  @Post()
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @HttpCode(HttpStatus.ACCEPTED)
  public async postInbox(@Req() req, @Body() activity: any, @Param('username') username: string) {
    this.logger.debug(`Received "${activity.type}" activity from ${req.connection.remoteAddress}`);
    if (activity.type === 'Create') {
      this.activityService.process(activity);
      return {
        status: 'accepted',
        message: 'The activity was queued for processing.',
        receipt: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 16) // @todo use a real, traceable id
      }
    }
    throw new NotImplementedException(`${activity.type} is not supported at this time.`);
  }
}
