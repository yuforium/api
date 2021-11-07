import { ApiProperty } from "@nestjs/swagger";

export class DomainDto {
  @ApiProperty()
  domainName: string;

  @ApiProperty()
  name: string;
}