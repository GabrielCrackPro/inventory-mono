# Room API Documentation

This document provides comprehensive information about the Room API endpoints, including authentication, request/response formats, and usage examples.

## Base URL

All room endpoints are prefixed with `/api/rooms`

## Authentication

All endpoints require JWT authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Room Types

- `PUBLIC` - Room is publicly accessible within the house
- `PRIVATE` - Room has restricted access

## Permission Levels

- `VIEW` - Can view room and items
- `EDIT` - Can view and modify room and items
- `ADMIN` - Full access including sharing and deletion

---

## Endpoints

### 1. Get All Rooms for User

Retrieves all rooms that the authenticated user owns or has shared access to.

**Endpoint:** `GET /api/rooms`

**Response:**

```json
[
  {
    "id": 1,
    "name": "Living Room",
    "type": "PUBLIC",
    "isShared": false,
    "houseId": 1,
    "ownerId": 1,
    "description": "Main living area",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "items": [
      {
        "id": 1,
        "name": "Sofa",
        "description": "Comfortable 3-seater sofa",
        "quantity": 1
      }
    ]
  }
]
```

### 2. Get Rooms by House

Retrieves all rooms for a specific house that the user has access to.

**Endpoint:** `GET /api/rooms/house/:houseId`

**Parameters:**

- `houseId` (number) - ID of the house

**Security:** User must have access to the specified house (owner or shared access)

**Response:** Same format as "Get All Rooms for User" but filtered by house

**Example:**

```bash
GET /api/rooms/house/1
```

### 3. Get Room by ID

Retrieves detailed information about a specific room.

**Endpoint:** `GET /api/rooms/:id`

**Parameters:**

- `id` (number) - Room ID

**Security:** User must have access to the room (owner, shared access, or house access)

**Response:**

```json
{
  "id": 1,
  "name": "Living Room",
  "type": "PUBLIC",
  "isShared": false,
  "houseId": 1,
  "ownerId": 1,
  "description": "Main living area",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "items": [...],
  "house": {
    "id": 1,
    "name": "My House",
    "address": "123 Main St"
  }
}
```

### 4. Create Room

Creates a new room in a house.

**Endpoint:** `POST /api/rooms`

**Security:** User must have access to the specified house

**Request Body:**

```json
{
  "name": "Kitchen",
  "type": "PUBLIC",
  "houseId": 1,
  "shared": false
}
```

**Required Fields:**

- `name` (string) - Room name
- `houseId` (number) - ID of the house where the room will be created

**Optional Fields:**

- `type` (RoomType) - Room type (PUBLIC or PRIVATE)
- `shared` (boolean) - Whether the room is shared

**Response:**

```json
{
  "id": 2,
  "name": "Kitchen",
  "type": "PUBLIC",
  "isShared": false,
  "houseId": 1,
  "ownerId": 1,
  "description": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 5. Update Room

Updates an existing room.

**Endpoint:** `PATCH /api/rooms/:id`

**Parameters:**

- `id` (number) - Room ID

**Security:**

- User must be room owner
- Requires ADMIN or MANAGER role
- If changing houseId, user must have access to the new house

**Request Body:** (All fields optional)

```json
{
  "name": "Updated Kitchen",
  "type": "PRIVATE",
  "houseId": 2,
  "shared": true
}
```

**Response:** Updated room object

### 6. Delete Room

Deletes a room and all its items.

**Endpoint:** `DELETE /api/rooms/:id`

**Parameters:**

- `id` (number) - Room ID

**Security:**

- User must be room owner
- Requires ADMIN role

**Response:**

```json
{
  "id": 1,
  "name": "Living Room",
  "message": "Room deleted successfully"
}
```

### 7. Share Room

Shares a room with another user.

**Endpoint:** `POST /api/rooms/:id/share`

**Parameters:**

- `id` (number) - Room ID

**Security:** User must be room owner

**Request Body:**

```json
{
  "userId": 2,
  "permission": "EDIT"
}
```

**Fields:**

- `userId` (number) - ID of user to share with
- `permission` (PermissionLevel) - Permission level (VIEW, EDIT, or ADMIN)

**Response:**

```json
{
  "id": 1,
  "roomId": 1,
  "userId": 2,
  "permission": "EDIT"
}
```

### 8. Revoke Room Access

Removes a user's access to a room.

**Endpoint:** `DELETE /api/rooms/:id/share/:userId`

**Parameters:**

- `id` (number) - Room ID
- `userId` (number) - ID of user whose access to revoke

**Security:** User must be room owner

**Response:**

```json
{
  "count": 1,
  "message": "Access revoked successfully"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "houseId must be a number"],
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Room access denied"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Room not found"
}
```

---

## Default Room Creation

When a new user registers, the system automatically creates:

1. A default house named "{User's Name}'s House"
2. A default room named "General Room" within that house

This ensures every new user has a starting point for organizing their items.

**Default Room Properties:**

- Name: "General Room"
- Type: PUBLIC
- Shared: false
- Owner: The newly registered user
- House: The user's default house

## Usage Examples

### Creating a Room in a House

```javascript
// First, get the house ID
const houses = await fetch('/api/houses', {
  headers: { Authorization: 'Bearer ' + token },
});

// Create room in the first house
const room = await fetch('/api/rooms', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Master Bedroom',
    type: 'PRIVATE',
    houseId: houses[0].id,
  }),
});
```

### Creating an Item in a Room

```javascript
// Create an item using the new enhanced structure
const item = await fetch('/api/items', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Laptop',
    description: 'Work laptop',
    category: 'Electronics',
    brand: 'Apple',
    model: 'MacBook Pro',
    serialNumber: 'ABC123456',
    condition: 'New',
    room: 'general-room', // Can be room name or ID
    location: 'Desk drawer',
    quantity: 1,
    unit: 'pieces',
    minStock: 1,
    tags: ['work', 'electronics'],
    isShared: false,
    sharedWith: [],
    visibility: 'private',
  }),
});
```

### Getting Rooms for a Specific House

```javascript
const houseId = 1;
const rooms = await fetch(`/api/rooms/house/${houseId}`, {
  headers: { Authorization: 'Bearer ' + token },
});
```

### Sharing a Room with Edit Permission

```javascript
const roomId = 1;
const targetUserId = 2;

const shareResult = await fetch(`/api/rooms/${roomId}/share`, {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: targetUserId,
    permission: 'EDIT',
  }),
});
```

---

## Security Notes

1. **House-Scoped Operations**: All room operations validate that the user has access to the house containing the room.

2. **Ownership Validation**: Only room owners can update, delete, or share rooms.

3. **Role-Based Access**: Some operations require specific roles (ADMIN, MANAGER).

4. **Access Inheritance**: Users with house access automatically get access to rooms within that house.

5. **Activity Logging**: All room operations are logged for audit purposes.

---

## Best Practices

1. **Always validate house access** before creating rooms
2. **Use appropriate permission levels** when sharing rooms
3. **Handle errors gracefully** in your client application
4. **Cache room data** when appropriate to reduce API calls
5. **Validate user permissions** before showing UI elements for restricted actions
