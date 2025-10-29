import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtUser, UserRole } from '@inventory/shared';
import { ApiDocs } from '../../shared';
import { GetUser, Roles } from '../auth/auth.decorator';
import { JwtAuthGuard, RolesGuard } from '../../shared';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('api/users')
@ApiDocs({ tags: ['users'], bearer: true })
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  @ApiDocs({
    summary: 'Create a new user',
    responses: [{ status: 201, description: 'User created' }],
  })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiDocs({
    summary: 'Get all users',
    responses: [{ status: 200, description: 'List of users' }],
  })
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiDocs({
    summary: 'Get a user by ID',
    responses: [{ status: 200, description: 'User details' }],
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiDocs({
    summary: 'Update a user by ID',
    responses: [{ status: 200, description: 'Updated user' }],
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @GetUser() user: JwtUser,
  ) {
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      return this.usersService.findOne(id);
    }
    return this.usersService.update(id, dto);
  }

  @Delete()
  removeAllUsers() {
    return this.usersService.removeAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiDocs({
    summary: 'Delete a user by ID',
    responses: [{ status: 200, description: 'User deleted' }],
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.usersService.removeAll();
  }
}
