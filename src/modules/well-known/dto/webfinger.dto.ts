import { Expose, Type } from 'class-transformer';
import { WebfingerLinkDto } from './webfinger-link.dto';

export class WebfingerDto {
  @Expose()
  public subject!: string;

  @Expose()
  public aliases!: string[];

  @Expose()
  @Type(() => WebfingerLinkDto)
  public links!: WebfingerLinkDto[];
}