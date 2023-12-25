import { Expose } from 'class-transformer';

export class WebfingerLinkDto {
  @Expose()
  public rel!: string;

  @Expose()
  public type!: string;

  @Expose()
  public href!: string;
}