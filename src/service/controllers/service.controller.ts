import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("service")
@Controller('service')
export class ServiceController 
{
	@Get()
	public getService ()
	{
		const siteId = process.env.SITE_ID, siteName = process.env.SITE_NAME

		return {
			type:   "Service",
			id:     siteId,
			name:   siteName,
			inbox:  `${siteId}/inbox`,
			outbox: `${siteId}/outbox`
		}
	}

	@Get("inbox")
	public getInbox ()
	{
	}

	@Post("inbox")
	public postInbox (data)
	{

	}
}
