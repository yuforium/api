import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { Forum } from '../models/forum.model';
import { ModelType } from '@typegoose/typegoose/lib/types';

@Injectable()
export class ForumsService 
{
	constructor (@InjectModel(Forum) protected readonly forumModel: ModelType<Forum>)
	{

	}

	async create (createForumDto: {path: string, name?: string, description?: string}): Promise<Forum>
	{
		const createdForum = new this.forumModel(createForumDto)

		return createdForum.save()
	}

	async get (path: string)
	{
		return this.forumModel.findOne({path})
	}
}
