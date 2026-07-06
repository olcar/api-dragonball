import { IsEnum } from 'class-validator';
import { UserRole } from 'src/interfaces/users.interface';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ enum: ['admin', 'user'] })
  @IsEnum(['admin', 'user'])
  role: UserRole;
}
