import { Prop } from "@nestjs/mongoose";
import { Exclude, Transform } from "class-transformer";
import { ObjectDto } from "src/common/dto/object/object.dto";

type Constructor = new (...args: any[]) => {};
export type GConstructor<T = {}> = new (...args: any[]) => T
type ObjectRecordConstructor = GConstructor<ObjectDto>;

type BaseObjectRecord = {
  _hostname: string;
  _path: string;
  _pathId: string;
  _id?: string;
  _public: boolean;
  _local: boolean;
}

export function BaseObjectSchema<TBase extends GConstructor<ObjectDto>>(Base: TBase): TBase & GConstructor<BaseObjectRecord>{
  class BaseObjectSchema extends Base implements BaseObjectRecord {
    @Exclude()
    public _id?: string;

    @Prop({type: String, required: true})
    @Exclude()
    public _hostname!: string;

    @Prop({type: String, required: true})
    @Exclude()
    public _path!: string;

    @Prop({type: String, required: true})
    @Exclude()
    public _pathId!: string;

    @Prop({type: Boolean, default: false})
    @Exclude()
    public _public!: boolean;

    @Prop({type: Boolean, required: true})
    @Exclude()
    public _local!: boolean;
  }

  return BaseObjectSchema;
}