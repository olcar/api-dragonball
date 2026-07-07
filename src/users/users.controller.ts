import {
  BadRequestException,
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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'Current user profile' })
  @Get('me')
  getProfile(@Req() req: Request) {
    return this.usersService.findOne(req.user.sub);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @Patch('me')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.usersService.findOneByEmail(dto.email);
      if (existing && existing.id !== req.user.sub) {
        throw new BadRequestException('Email already in use');
      }
    }
    await this.usersService.update(req.user.sub, dto);
    return this.usersService.findOne(req.user.sub);
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Change user role (admin only)' })
  @Roles('admin')
  @UseGuards(RolesGuard)
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

  @ApiOperation({ summary: 'Delete a user (admin only)' })
  @Roles('admin')
  @UseGuards(RolesGuard)
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
