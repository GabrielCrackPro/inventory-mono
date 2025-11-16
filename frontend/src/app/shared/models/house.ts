// Re-export shared types for backward compatibility
export type {
  House,
  HouseWithRelations,
  CreateHouseData,
  UpdateHouseData,
} from '@inventory/shared';

export { HousePermission } from '@inventory/shared';

// Note: HouseAccess is in the access model, not house model
