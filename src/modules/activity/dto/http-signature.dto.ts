import { IsEnum, IsRFC3339, IsString, IsUrl } from 'class-validator';

export class HttpSignatureDto {
  @IsString()
  @IsEnum(['RsaSignature2017'])
  public type!: string;

  @IsUrl()
  public creator!: string;

  @IsString()
  @IsRFC3339()
  public created!: string;

  @IsString()
  public signatureValue!: string;
}
