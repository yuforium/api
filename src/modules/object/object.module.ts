import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectService } from './object.service';
import { ObjectSchema } from './schema/object.schema';
import { ObjectController } from './object.controller';

@Module({
  providers: [ObjectService],
  imports: [
    MongooseModule.forFeature([
      {name: 'Object', schema: ObjectSchema}
    ])
  ],
  exports: [ObjectService],
  controllers: [ObjectController]
})
export class ObjectModule {}
