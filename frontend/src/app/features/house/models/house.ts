export interface UserHouse {
  id: number;
  name: string;
  address: string;
  items: any[];
  rooms: any[];
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}
