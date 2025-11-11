import { IsString, IsUrl } from 'class-validator';

export class AddAttachmentDto {
  @IsUrl()
  url!: string;

  @IsString()
  type!: string;
}
