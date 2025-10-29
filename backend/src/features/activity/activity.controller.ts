import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserRole, JwtUser } from '@inventory/shared';
import { ApiDocs } from '../../shared';
import { GetUser, Roles } from '../auth';
import { JwtAuthGuard, RolesGuard } from '../../shared';
import { CreateActivityDto, GetActivitiesDto } from './activity.dto';
import { ActivityService } from './activity.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiDocs({ tags: ['activities'], bearer: true })
@Controller('api/activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiDocs({
    summary: 'Create a new activity',
    responses: [{ status: 201, description: 'Activity created' }],
  })
  /**
   * Create a new activity record
   * @param data The activity data
   * @param user The authenticated user
   * @param req The request object for IP and user agent
   * @returns The created activity
   */
  async create(
    @Body() data: CreateActivityDto,
    @GetUser() user: JwtUser,
    @Request() req: any,
  ) {
    const activityData = {
      ...data,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
    };

    return this.activityService.create(user.id, activityData);
  }

  @Get()
  @ApiDocs({
    summary: 'Get activities for the authenticated user',
    responses: [{ status: 200, description: 'List of user activities' }],
  })
  /**
   * Get activities for the authenticated user
   * @param user The authenticated user
   * @param filters Optional query filters
   * @returns Array of activities
   */
  async findAll(@GetUser() user: JwtUser, @Query() filters: GetActivitiesDto) {
    return this.activityService.findAllForUser(user.id, filters);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  @ApiDocs({
    summary: 'Get all activities (admin only)',
    responses: [{ status: 200, description: 'List of all activities' }],
  })
  /**
   * Get all activities (admin only)
   * @param filters Optional query filters
   * @returns Array of activities
   */
  async findAllActivities(@Query() filters: GetActivitiesDto) {
    return this.activityService.findAll(filters);
  }

  @Get('statistics')
  @ApiDocs({
    summary: 'Get activity statistics for the authenticated user',
    responses: [{ status: 200, description: 'Activity statistics' }],
  })
  /**
   * Get activity statistics for the authenticated user
   * @param user The authenticated user
   * @returns Activity statistics
   */
  async getStatistics(@GetUser() user: JwtUser) {
    return this.activityService.getStatistics(user.id);
  }

  @Get(':id')
  @ApiDocs({
    summary: 'Get a single activity by its ID',
    responses: [{ status: 200, description: 'Activity details' }],
  })
  /**
   * Get a single activity by its ID
   * @param id The activity ID
   * @returns The activity
   */
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.findById(id);
  }
}
