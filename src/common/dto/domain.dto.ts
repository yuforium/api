import { ApiProperty } from "@nestjs/swagger";

export class DomainDto {
  @ApiProperty()
  domainName: string | undefined;

  @ApiProperty()
  name: string | undefined;
}