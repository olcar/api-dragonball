import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiExcludeEndpoint()
  @Patch(':id/role')
  async updateRole(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    if (req.user.sub === id && updateRoleDto.role !== 'admin') {
      throw new ForbiddenException('Cannot remove your own admin role');
    }
    const result = await this.usersService.update(id, updateRoleDto);
    if (result.affected === 0) {
      throw new ForbiddenException('User not found');
    }
    return this.usersService.findOne(id);
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    if (req.user.sub === id) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    const target = await this.usersService.findOne(id);
    if (!target) {
      throw new ForbiddenException('User not found');
    }
    if (target.role === 'admin') {
      const adminCount = await this.usersService.countAdmins();
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot delete the last admin');
      }
    }
    await this.usersService.remove(id);
  }
}
