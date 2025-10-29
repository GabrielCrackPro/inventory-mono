import { ActivityType } from "../models/activity";

/**
 * Activity creation DTO
 */
export interface CreateActivityDto {
  name: string;
  description?: string;
  type: ActivityType;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Activity query DTO
 */
export interface GetActivitiesDto {
  type?: ActivityType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  userId?: number;
}

/**
 * Activity response DTO
 */
export interface ActivityResponseDto {
  id: number;
  name: string;
  description: string;
  type: ActivityType;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

/**
 * Activity list response DTO
 */
export interface ActivityListResponseDto {
  data: ActivityResponseDto[];
  total: number;
}
