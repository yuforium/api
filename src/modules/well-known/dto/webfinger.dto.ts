import { Expose, Transform, Type } from "class-transformer";
import { sslToPlain } from "../../../common/dto/util/ssl-to-plain";
import { WebfingerLinkDto } from "./webfinger-link.dto";

export class WebfingerDto {
    @Expose()
    public subject!: string;

    @Expose()
    @Transform(sslToPlain, {groups: ['sslToPlain']})
    public aliases!: string[];

    @Expose()
    @Type(() => WebfingerLinkDto)
    public links!: WebfingerLinkDto[];
}