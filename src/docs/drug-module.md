# Drug Module Documentation

## Overview

The drug module handles all drug-related operations in the MedMap application, including creating, updating, searching, and managing drug inventory for pharmacies.

## Base URL

```
/api/v1/drugs
```

## Response Format

All endpoints return responses in the following format:

```json
{
  "status": "success" | "error",
  "message": "string",
  "data": object | array
}
```

## Endpoints

### 1. Search Drugs

Search for drugs with various filters and pagination.

- **URL:** `/search`
- **Method:** `GET`
- **Authentication:** Not required
- **Query Parameters:**
  ```typescript
  {
    page?: number;        // default: 1
    limit?: number;       // default: 10
    name?: string;        // search by drug name
    illnessId?: string;   // filter by illness
    minStocks?: number;   // minimum stock level
    maxStocks?: number;   // maximum stock level
    minPrice?: number;    // minimum price
    maxPrice?: number;    // maximum price
  }
  ```
- **Success Response:**
  ```json
  {
    "status": "success",
    "message": "Drugs retrieved successfully",
    "data": {
      "data": [
        {
          "id": "string",
          "name": "string",
          "description": "string",
          "sideEffects": ["string"],
          "pharmacyId": "string",
          "expiryDate": "string",
          "imageUrl": "string",
          "price": number,
          "stocks": number,
          "pharmacy": {
            "id": "string",
            "name": "string",
            "email": "string",
            "description": "string",
            "logoUrl": "string",
            "shopImageUrl": "string",
            "contactInfo": {
              "address": "string",
              "phone": "string",
              "state": "string",
              "country": "string",
              "longitude": number,
              "latitude": number
            }
          },
          "illnessDrugs": [
            {
              "illness": "string"
            }
          ]
        }
      ],
      "pagination": {
        "total": number,
        "page": number,
        "limit": number,
        "totalPages": number
      }
    }
  }
  ```

### 2. Get All Drugs

Get all drugs with optional filters.

- **URL:** `/`
- **Method:** `GET`
- **Authentication:** Not required
- **Query Parameters:**
  ```typescript
  {
    illnessId?: string;   // filter by illness
    minStocks?: number;   // minimum stock level
    maxStocks?: number;   // maximum stock level
    minPrice?: number;    // minimum price
    maxPrice?: number;    // maximum price
  }
  ```
- **Success Response:** Same as search endpoint without pagination

### 3. Get Drug by ID

Get a specific drug's details.

- **URL:** `/:id`
- **Method:** `GET`
- **Authentication:** Not required
- **Success Response:**
  ```json
  {
    "status": "success",
    "message": "Drug retrieved successfully",
    "data": {
      "id": "string",
      "name": "string",
      "description": "string",
      "sideEffects": ["string"],
      "pharmacyId": "string",
      "expiryDate": "string",
      "imageUrl": "string",
      "price": number,
      "stocks": number,
      "pharmacy": {
        // pharmacy details
      },
      "illnessDrugs": [
        {
          "illness": "string"
        }
      ]
    }
  }
  ```

### 4. Get My Drugs (Pharmacy)

Get all drugs belonging to the authenticated pharmacy.

- **URL:** `/me`
- **Method:** `GET`
- **Authentication:** Required (Pharmacy)
- **Success Response:**
  ```json
  {
    "status": "success",
    "message": "Your drugs retrieved successfully",
    "data": [
      // Array of drug objects
    ]
  }
  ```

### 5. Create Drug

Create a new drug entry.

- **URL:** `/`
- **Method:** `POST`
- **Authentication:** Required (Pharmacy)
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  ```typescript
  {
    name: string;                // required
    description?: string;        // optional
    sideEffects: string[];      // required
    expiryDate: Date;           // required
    price: number;              // required, min: 0
    stocks?: number;            // optional, default: 1, min: 0
    composition?: string;       // optional
    manufacturer?: string;      // optional
    uses?: string;             // optional
    illnessIds?: string[];     // optional
    image?: File;              // optional
  }
  ```
- **Success Response:**
  ```json
  {
    "status": "success",
    "message": "Drug created successfully",
    "data": {
      // Created drug object
    }
  }
  ```

### 6. Update Drug

Update an existing drug entry.

- **URL:** `/:id`
- **Method:** `PATCH`
- **Authentication:** Required (Pharmacy + Drug Ownership)
- **Content-Type:** `multipart/form-data`
- **Request Body:** Same as Create Drug (all fields optional)
- **Success Response:**
  ```json
  {
    "status": "success",
    "message": "Drug updated successfully",
    "data": {
      // Updated drug object
    }
  }
  ```

### 7. Delete Drug

Delete an existing drug entry.

- **URL:** `/:id`
- **Method:** `DELETE`
- **Authentication:** Required (Pharmacy + Drug Ownership)
- **Success Response:**
  ```json
  {
    "status": "success",
    "message": "Drug deleted successfully",
    "data": {
      // Deleted drug object
    }
  }
  ```

## Error Responses

All endpoints may return the following error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "error": {
    "cause": "string",
    "statusCode": number
  }
}
```

Common error status codes:

- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Missing or invalid authentication)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Authentication

Protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## File Upload

For endpoints that accept image uploads:

- Maximum file size: 5MB
- Supported formats: JPG, JPEG, PNG
- Field name: `image`
