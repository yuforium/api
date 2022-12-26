import { Prop } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import { ObjectDto } from "src/common/dto/object/object.dto";

type Constructor = new (...args: any[]) => {};
export type GConstructor<T = {}> = new (...args: any[]) => T
type ObjectRecordConstructor = GConstructor<ObjectDto>;

type BaseObjectRecord = {
  _serviceId?: string;
  _id?: string;
  _public?: boolean;
}

export function BaseObjectSchema<TBase extends GConstructor<ObjectDto>>(Base: TBase): TBase & GConstructor<BaseObjectRecord>{
  class BaseObjectSchema extends Base implements BaseObjectRecord {
    @Exclude()
    public _id?: string;

    @Prop({type: String})
    @Exclude()
    public _serviceId?: string;

    @Prop({type: Boolean, default: false})
    @Exclude()
    public _public?: boolean;
  }

  return BaseObjectSchema;
}