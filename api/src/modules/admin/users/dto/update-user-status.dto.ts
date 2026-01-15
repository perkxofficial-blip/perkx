import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../../../entities';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'User status (ACTIVE or DEACTIVATE only)',
    enum: [UserStatus.ACTIVE, UserStatus.DEACTIVATE],
    example: UserStatus.ACTIVE,
  })
  @IsEnum([UserStatus.ACTIVE, UserStatus.DEACTIVATE], {
    message: 'Status must be either ACTIVE or DEACTIVATE',
  })
  status: UserStatus.ACTIVE | UserStatus.DEACTIVATE;
}
