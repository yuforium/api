import { Expose, Transform } from "class-transformer";
import { sslToPlain } from "src/common/dto/util/ssl-to-plain";

export class WebfingerLinkDto {
    @Expose()
    public rel!: string;

    @Expose()
    public type!: string;

    @Expose()
    @Transform(sslToPlain, {groups: ['sslToPlain']})
    public href!: string;
}