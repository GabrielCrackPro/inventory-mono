import { Injectable } from '@angular/core';

export interface RoomTypeInfo {
  type: string;
  placeholders: string[];
  helpText: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  /**
   * Infer room type based on room name for better iconography
   */
  inferRoomType(roomName: string): string {
    const name = roomName.toLowerCase();

    if (name.includes('kitchen')) return 'kitchen';
    if (name.includes('bedroom') || name.includes('bed')) return 'bedroom';
    if (name.includes('bathroom') || name.includes('bath')) return 'bathroom';
    if (name.includes('living') || name.includes('lounge')) return 'living';
    if (name.includes('garage')) return 'garage';
    if (name.includes('basement') || name.includes('cellar')) return 'basement';
    if (name.includes('attic') || name.includes('loft')) return 'attic';
    if (name.includes('office') || name.includes('study')) return 'office';
    if (name.includes('dining')) return 'dining';
    if (name.includes('pantry') || name.includes('storage')) return 'storage';
    if (name.includes('laundry')) return 'laundry';
    if (name.includes('closet') || name.includes('wardrobe')) return 'closet';

    return 'general';
  }

  /**
   * Get room type information including placeholders and help text
   */
  getRoomTypeInfo(roomType: string): RoomTypeInfo {
    const roomTypeData: Record<string, RoomTypeInfo> = {
      kitchen: {
        type: 'kitchen',
        placeholders: [
          'Top cabinet',
          'Under sink',
          'Pantry shelf 2',
          'Spice rack',
          'Counter drawer',
        ],
        helpText: 'Be specific about cabinet, shelf, or drawer location',
      },
      bedroom: {
        type: 'bedroom',
        placeholders: ['Nightstand drawer', 'Under bed', 'Closet shelf', 'Dresser top', 'Wardrobe'],
        helpText: 'Specify furniture piece and location within the bedroom',
      },
      bathroom: {
        type: 'bathroom',
        placeholders: [
          'Medicine cabinet',
          'Under sink',
          'Linen closet',
          'Shower caddy',
          'Vanity drawer',
        ],
        helpText: 'Include cabinet, shelf, or storage area details',
      },
      living: {
        type: 'living',
        placeholders: [
          'Coffee table drawer',
          'TV stand',
          'Bookshelf',
          'Side table',
          'Entertainment center',
        ],
        helpText: 'Mention specific furniture or entertainment area',
      },
      garage: {
        type: 'garage',
        placeholders: [
          'Tool cabinet',
          'Workbench',
          'Storage rack 3',
          'Pegboard',
          'Overhead storage',
        ],
        helpText: 'Include workstation or storage system details',
      },
      basement: {
        type: 'basement',
        placeholders: [
          'Storage shelf',
          'Corner cabinet',
          'Utility room',
          'Wine rack',
          'Storage bins',
        ],
        helpText: 'Specify area or storage system in basement',
      },
      attic: {
        type: 'attic',
        placeholders: ['Storage box', 'Corner area', 'Near window', 'Under eaves', 'Center area'],
        helpText: 'Describe location within attic space',
      },
      office: {
        type: 'office',
        placeholders: ['Desk drawer', 'Filing cabinet', 'Bookshelf', 'Supply closet', 'Wall shelf'],
        helpText: 'Include desk, cabinet, or organizational system',
      },
      dining: {
        type: 'dining',
        placeholders: ['China cabinet', 'Sideboard', 'Table drawer', 'Buffet', 'Corner hutch'],
        helpText: 'Specify dining furniture or display area',
      },
      storage: {
        type: 'storage',
        placeholders: ['Shelf 2', 'Storage bin', 'Corner area', 'Metal rack', 'Plastic container'],
        helpText: 'Include shelf number or container type',
      },
      laundry: {
        type: 'laundry',
        placeholders: [
          'Above washer',
          'Utility cabinet',
          'Shelf',
          'Laundry basket',
          'Supply closet',
        ],
        helpText: 'Mention appliance area or storage location',
      },
      closet: {
        type: 'closet',
        placeholders: ['Top shelf', 'Hanging organizer', 'Floor level', 'Shoe rack', 'Storage box'],
        helpText: 'Specify shelf level or organizational system',
      },
    };

    return (
      roomTypeData[roomType] || {
        type: 'general',
        placeholders: ['Top shelf', 'Under sink', 'Drawer 2', 'Cabinet', 'Storage area'],
        helpText: 'Be specific to help you find items quickly',
      }
    );
  }

  /**
   * Get a random placeholder for a room type
   */
  getRandomPlaceholder(roomType: string): string {
    const roomInfo = this.getRoomTypeInfo(roomType);
    const randomIndex = Math.floor(Math.random() * roomInfo.placeholders.length);
    return `e.g., ${roomInfo.placeholders[randomIndex]}`;
  }

  /**
   * Transform room data for display
   */
  transformRoomForDisplay(room: any): any {
    return {
      name: room.name,
      value: room.name.toLowerCase().split(' ').join('-'),
      type: this.inferRoomType(room.name),
      description: room.description || null,
    };
  }
}
