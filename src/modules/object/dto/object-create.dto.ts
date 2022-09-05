import { OmitType, PartialType } from "@nestjs/swagger";
import { ObjectDto } from "./object.dto";

export class ObjectCreateDto extends PartialType(
  OmitType(ObjectDto, ['id'])
) {
}