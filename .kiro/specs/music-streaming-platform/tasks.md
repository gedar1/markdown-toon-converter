# Implementation Plan: Music Streaming Platform

## Overview

Este plan de implementación desglosa el desarrollo de la plataforma de streaming de música en tareas incrementales y ejecutables. La arquitectura es un monolito modular con Node.js/TypeScript, PostgreSQL, y React/React Native para los clientes. El enfoque prioriza un MVP funcional con testing comprehensivo de las 32 propiedades de corrección.

## Tasks

- [x] 1. Project setup and infrastructure
  - Initialize Node.js/TypeScript project with pnpm
  - Configure TypeScript, ESLint, Prettier
  - Set up project structure with modular architecture (src/modules/, src/shared/, src/api/)
  - Install core dependencies: Express/Fastify, Prisma, jsonwebtoken, bcrypt, multer, Jest, fast-check
  - Create .env.example with configuration variables
  - Set up uploads/ directory structure (audio/, covers/, avatars/)
  - _Requirements: 8.1, 8.2_

- [x] 2. Database setup and schema
  - [x] 2.1 Configure Prisma and PostgreSQL connection
    - Create prisma/schema.prisma with database configuration
    - Set up database client in src/shared/database/client.ts
    - _Requirements: 3.1, 3.2_

  - [x] 2.2 Define database schema for all domains
    - Create users, creator_profiles, subscriber_profiles tables
    - Create content, playlists, playlist_content tables
    - Create access_codes, access_grants tables
    - Create stream_sessions table
    - Add all indexes for performance optimization
    - _Requirements: 1.1, 2.1, 4.1, 5.1, 6.1, 7.1_

  - [x] 2.3 Create initial database migration
    - Generate Prisma migration files
    - Test migration on local PostgreSQL instance
    - _Requirements: 3.1_

- [x] 3. Shared utilities and error handling
  - [x] 3.1 Implement error handling infrastructure
    - Create AppError base class in src/shared/errors/AppError.ts
    - Create specific error classes (AuthenticationError, AccessDeniedError, ValidationError, NotFoundError)
    - Implement global error handler middleware in src/shared/errors/errorHandler.ts
    - _Requirements: 6.2, 2.2, 5.3_

  - [x] 3.2 Create shared utilities
    - Implement logger utility (src/shared/utils/logger.ts)
    - Implement validation helpers (src/shared/utils/validation.ts)
    - Implement crypto utilities for token generation (src/shared/utils/crypto.ts)
    - _Requirements: 6.1, 9.1_

  - [x] 3.3 Define common TypeScript types
    - Create shared types in src/shared/types/common.types.ts
    - Define API response formats (SuccessResponse, ErrorResponse)
    - _Requirements: 8.2_

- [-] 4. Authentication module implementation
  - [x] 4.1 Implement authentication service
    - Create auth.service.ts with register, login, validateToken methods
    - Implement password hashing with bcrypt
    - Implement JWT token generation and validation
    - Implement password reset and change password functionality
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [x] 4.2 Create authentication middleware
    - Implement JWT validation middleware in auth.middleware.ts
    - Implement role-based authorization middleware (creator/subscriber)
    - _Requirements: 6.1, 6.4_

  - [x] 4.3 Create authentication controller and routes
    - Implement auth.controller.ts with HTTP handlers
    - Create auth.routes.ts with POST /auth/register, /auth/login, /auth/reset-password
    - _Requirements: 6.1, 6.2, 6.5_

  - [ ]\* 4.4 Write property test for authentication
    - **Property 18: Valid credentials issue tokens**
    - **Validates: Requirements 6.1**

  - [ ]\* 4.5 Write property test for invalid credentials
    - **Property 19: Invalid credentials are rejected**
    - **Validates: Requirements 6.2**

  - [ ]\* 4.6 Write property test for password complexity
    - **Property 20: Password complexity enforcement**
    - **Validates: Requirements 6.3**

  - [ ]\* 4.7 Write property test for expired tokens
    - **Property 21: Expired token rejection**
    - **Validates: Requirements 6.4**

  - [ ]\* 4.8 Write unit tests for authentication edge cases
    - Test duplicate email registration
    - Test missing required fields
    - Test token expiration edge cases
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 5. Checkpoint - Ensure authentication tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. User management module implementation
  - [x] 6.1 Implement user management service
    - Create users.service.ts with creator and subscriber profile operations
    - Implement getCreatorProfile, updateCreatorProfile, getCreatorSubscribers
    - Implement getSubscriberProfile, updateSubscriberProfile, getSubscriberAccessList
    - Implement listCreators, searchCreators for discovery
    - _Requirements: 1.1, 1.2, 7.1, 7.2, 10.1, 10.2, 10.3_

  - [x] 6.2 Create user management controller and routes
    - Implement users.controller.ts with HTTP handlers
    - Create users.routes.ts with GET/PUT /creators/:id, GET /subscribers/:id, GET /creators
    - Add authentication middleware to all routes
    - _Requirements: 1.1, 1.2, 7.1, 10.1_

  - [ ]\* 6.3 Write property test for unique creator creation
    - **Property 1: Unique creator account creation**
    - **Validates: Requirements 1.1**

  - [ ]\* 6.4 Write property test for profile update persistence
    - **Property 2: Profile update persistence (Round-trip)**
    - **Validates: Requirements 1.2**

  - [ ]\* 6.5 Write property test for empty library initialization
    - **Property 3: Empty library initialization**
    - **Validates: Requirements 1.4**

  - [ ]\* 6.6 Write property test for subscriber list accuracy
    - **Property 22: Subscriber list accuracy**
    - **Validates: Requirements 7.1**

  - [ ]\* 6.7 Write property test for creator preview completeness
    - **Property 30: Creator preview information completeness**
    - **Validates: Requirements 10.2**

  - [ ]\* 6.8 Write property test for search result relevance
    - **Property 31: Search result relevance**
    - **Validates: Requirements 10.3**

  - [ ]\* 6.9 Write property test for access status indication
    - **Property 32: Access status indication**
    - **Validates: Requirements 10.4**

  - [ ]\* 6.10 Write unit tests for user management
    - Test profile update validation
    - Test creator search filters
    - Test subscriber access list retrieval
    - _Requirements: 1.2, 7.1, 10.3_

- [ ] 7. Access control module implementation
  - [x] 7.1 Implement access control service
    - Create access.service.ts with access code management
    - Implement generateAccessCode with unique code generation
    - Implement redeemAccessCode with single-use validation
    - Implement validateAccess for authorization checks
    - Implement invalidateAccessCode for payment failures
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 9.2, 9.3, 9.4_

  - [x] 7.2 Implement payment webhook handler
    - Create handlePaymentWebhook method in access.service.ts
    - Handle payment.success, payment.failed, payment.refunded events
    - Implement idempotency key checking to prevent duplicate processing
    - _Requirements: 9.1, 9.4_

  - [x] 7.3 Create access control controller and routes
    - Implement access.controller.ts with HTTP handlers
    - Create access.routes.ts with POST /access/redeem, GET /access/validate, POST /webhooks/payment
    - Add authentication middleware (except for webhook endpoint)
    - _Requirements: 2.1, 2.5, 9.1_

  - [ ]\* 7.4 Write property test for valid code redemption
    - **Property 4: Valid code redemption grants access**
    - **Validates: Requirements 2.1**

  - [ ]\* 7.5 Write property test for invalid code rejection
    - **Property 5: Invalid codes are rejected**
    - **Validates: Requirements 2.2**

  - [ ]\* 7.6 Write property test for redemption tracking
    - **Property 6: Redemption tracking**
    - **Validates: Requirements 2.3**

  - [ ]\* 7.7 Write property test for single-use codes
    - **Property 7: Single-use access codes**
    - **Validates: Requirements 2.4**

  - [ ]\* 7.8 Write property test for access-based authorization
    - **Property 8: Access-based authorization**
    - **Validates: Requirements 2.5**

  - [ ]\* 7.9 Write property test for unique code generation
    - **Property 26: Unique access code generation**
    - **Validates: Requirements 9.1**

  - [ ]\* 7.10 Write property test for code association
    - **Property 27: Access code association**
    - **Validates: Requirements 9.2**

  - [ ]\* 7.11 Write property test for expiration calculation
    - **Property 28: Expiration date calculation**
    - **Validates: Requirements 9.3**

  - [ ]\* 7.12 Write property test for failed payment invalidation
    - **Property 29: Failed payment invalidation**
    - **Validates: Requirements 9.4**

  - [ ]\* 7.13 Write property test for access revocation
    - **Property 24: Access revocation enforcement**
    - **Validates: Requirements 7.3**

  - [ ]\* 7.14 Write unit tests for access control
    - Test webhook idempotency
    - Test expired code redemption
    - Test access validation edge cases
    - _Requirements: 2.2, 2.4, 9.4_

- [ ] 8. Checkpoint - Ensure access control tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Content management module implementation
  - [x] 9.1 Implement content management service
    - Create content.service.ts with content operations
    - Implement uploadContent with file validation and storage
    - Implement updateContent, deleteContent with proper cleanup
    - Implement getContent, getCreatorLibrary with access filtering
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 9.2 Implement playlist management
    - Add createPlaylist, updatePlaylist, deletePlaylist methods
    - Add getCreatorPlaylists method
    - Implement playlist-content association logic
    - _Requirements: 5.5_

  - [x] 9.3 Implement file upload and validation
    - Configure multer for audio file uploads
    - Implement audio format validation (MP3, WAV, FLAC)
    - Implement file size limits and error handling
    - Store files in uploads/audio/{creatorId}/{contentId}/
    - _Requirements: 5.1, 5.3_

  - [x] 9.4 Create content management controller and routes
    - Implement content.controller.ts with HTTP handlers
    - Create content.routes.ts with POST /content, GET /content/:id, DELETE /content/:id
    - Add routes for playlists: POST /playlists, GET /playlists/:id
    - Add authentication and creator authorization middleware
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ]\* 9.5 Write property test for content upload
    - **Property 14: Content upload adds to library**
    - **Validates: Requirements 5.1**

  - [ ]\* 9.6 Write property test for content deletion
    - **Property 15: Content deletion removes access**
    - **Validates: Requirements 5.2**

  - [ ]\* 9.7 Write property test for format validation
    - **Property 16: Invalid format rejection**
    - **Validates: Requirements 5.3**

  - [ ]\* 9.8 Write property test for metadata generation
    - **Property 17: Metadata generation on upload**
    - **Validates: Requirements 5.4**

  - [ ]\* 9.9 Write property test for creator data isolation
    - **Property 9: Creator data isolation**
    - **Validates: Requirements 3.1**

  - [ ]\* 9.10 Write property test for access-filtered visibility
    - **Property 10: Access-filtered content visibility**
    - **Validates: Requirements 3.2, 3.4**

  - [ ]\* 9.11 Write unit tests for content management
    - Test file upload with various formats
    - Test content deletion cleanup
    - Test playlist operations
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 10. Streaming module implementation
  - [x] 10.1 Implement HLS manifest generation
    - Create streaming.service.ts with HLS support
    - Implement audio segmentation for HLS (use ffmpeg or similar)
    - Generate .m3u8 manifest files
    - Store segments in uploads/audio/{creatorId}/{contentId}/segments/
    - _Requirements: 4.3, 4.4_

  - [x] 10.2 Implement stream session management
    - Implement initializeStream with access validation
    - Implement getStreamManifest, getStreamSegment for content delivery
    - Implement endStream with analytics recording
    - Track session duration, bytes transferred, completion percentage
    - _Requirements: 4.1, 4.2, 4.5_

  - [x] 10.3 Create streaming controller and routes
    - Implement streaming.controller.ts with HTTP handlers
    - Create streaming.routes.ts with POST /stream/init, GET /stream/:sessionId/manifest.m3u8
    - Add GET /stream/:sessionId/segment/:segmentId for segment delivery
    - Add authentication and access validation middleware
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]\* 10.4 Write property test for stream authorization
    - **Property 12: Stream authorization based on access**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]\* 10.5 Write property test for session tracking
    - **Property 13: Stream session tracking**
    - **Validates: Requirements 4.5**

  - [ ]\* 10.6 Write property test for multiple access grants
    - **Property 11: Multiple simultaneous access grants**
    - **Validates: Requirements 3.3**

  - [ ]\* 10.7 Write unit tests for streaming
    - Test HLS manifest generation
    - Test segment delivery
    - Test stream session lifecycle
    - _Requirements: 4.3, 4.4, 4.5_

- [ ] 11. Checkpoint - Ensure streaming tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. API integration and error handling
  - [x] 12.1 Create main Express/Fastify application
    - Create src/api/app.ts with Express/Fastify setup
    - Configure middleware: cors, helmet, body-parser, morgan
    - Mount all route modules (auth, users, content, access, streaming)
    - Add global error handler middleware
    - _Requirements: 8.1, 8.2_

  - [x] 12.2 Implement consistent API response format
    - Create response wrapper utilities
    - Ensure all endpoints return consistent JSON structure
    - Add status, data, error fields to all responses
    - _Requirements: 8.2_

  - [ ]\* 12.3 Write property test for JSON response consistency
    - **Property 25: JSON response format consistency**
    - **Validates: Requirements 8.2**

  - [ ]\* 12.4 Write integration tests for API endpoints
    - Test authentication flow end-to-end
    - Test content upload and streaming flow
    - Test access code redemption flow
    - _Requirements: 6.1, 4.1, 2.1_

- [x] 13. Create server entry point
  - Create src/server.ts with application startup
  - Configure port and environment variables
  - Add graceful shutdown handling
  - Add database connection initialization
  - _Requirements: 8.1_

- [ ] 14. Property-based test infrastructure
  - [ ] 14.1 Create fast-check generators for domain objects
    - Create generators for User, Creator, Subscriber
    - Create generators for Content, Playlist
    - Create generators for AccessCode, AccessGrant
    - Create generators for StreamSession
    - Place in tests/property/generators.ts

  - [ ] 14.2 Create test database setup utilities
    - Implement test database initialization
    - Create fixtures for common test scenarios
    - Implement cleanup utilities for test isolation
    - Place in tests/setup.ts

  - [ ] 14.3 Configure Jest for property-based testing
    - Update jest.config.js with fast-check integration
    - Set test timeout for property tests (longer than unit tests)
    - Configure test coverage reporting

- [ ] 15. Subscriber information completeness property test
  - [ ]\* 15.1 Write property test for subscriber info
    - **Property 23: Subscriber information completeness**
    - **Validates: Requirements 7.2**

- [ ] 16. Web client implementation (MVP)
  - [x] 16.1 Initialize React web application
    - Create React + TypeScript + Vite project in client-web/
    - Install dependencies: React Router, React Query, Zustand, Tailwind CSS
    - Configure API client with axios
    - _Requirements: 8.1, 8.3_

  - [ ] 16.2 Implement authentication UI
    - Create login and registration pages
    - Implement JWT token storage and refresh
    - Create protected route wrapper
    - _Requirements: 6.1, 6.2_

  - [x] 16.3 Implement creator dashboard
    - Create creator profile page
    - Create content upload interface
    - Create subscriber list view
    - _Requirements: 1.2, 5.1, 7.1_

  - [ ] 16.4 Implement subscriber interface
    - Create creator discovery page
    - Create access code redemption interface
    - Create audio player with HLS support (use hls.js)
    - _Requirements: 2.1, 4.1, 10.1_

  - [ ]\* 16.5 Write end-to-end tests for web client
    - Test authentication flow
    - Test content upload flow
    - Test streaming playback
    - _Requirements: 6.1, 5.1, 4.1_

- [ ] 17. Documentation and deployment preparation
  - [ ] 17.1 Create API documentation
    - Generate OpenAPI/Swagger documentation
    - Document all endpoints with request/response examples
    - Add authentication requirements to docs
    - _Requirements: 8.1, 8.2_

  - [ ] 17.2 Create deployment documentation
    - Write README.md with setup instructions
    - Document environment variables in .env.example
    - Create database migration guide
    - Document file storage requirements
    - _Requirements: 8.1_

  - [ ] 17.3 Create Docker configuration (optional)
    - Create Dockerfile for Node.js application
    - Create docker-compose.yml with PostgreSQL
    - Document Docker deployment process

- [ ] 18. Final checkpoint - Complete system validation
  - Run all unit tests and property tests
  - Verify all 32 correctness properties pass
  - Test complete user flows end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate the 32 universal correctness properties from the design
- Unit tests validate specific examples, edge cases, and error conditions
- Checkpoints ensure incremental validation at key milestones
- The modular architecture allows parallel development of different modules
- File storage uses local filesystem for MVP with clear path to S3/CDN migration
- Mobile client (React Native) can be added after web MVP is complete
