# Diagrama de Arquitectura Hexagonal

## Vista General

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Controller  │  │    Routes    │  │  Middleware  │          │
│  └──────┬───────┘  └──────────────┘  └──────────────┘          │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    AuthService                            │   │
│  │  (Dependency Injection & Orchestration)                   │   │
│  └───────────────────────┬──────────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ RegisterUser │  │  LoginUser   │  │ ValidateToken│          │
│  │  (Use Case)  │  │  (Use Case)  │  │  (Use Case)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                    │
│         └─────────────────┼─────────────────┘                    │
│                           │                                      │
│  ┌────────────────────────┼────────────────────────────────┐    │
│  │              PORTS (Interfaces)                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │IUserRepository│  │ITokenService │  │IPasswordSvc  │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │    │
│  └───────────────────────┬──────────────────────────────────┘    │
└──────────────────────────┼──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Prisma    │  │     JWT      │  │    Bcrypt    │          │
│  │  Repository  │  │TokenService  │  │PasswordSvc   │          │
│  │  (Adapter)   │  │  (Adapter)   │  │  (Adapter)   │          │
│  └──────┬───────┘  └──────────────┘  └──────────────┘          │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SYSTEMS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │   JWT Lib    │  │  Bcrypt Lib  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Registro de Usuario

```
1. HTTP Request
   POST /auth/register
   {
     "email": "user@example.com",
     "password": "Password123",
     "userType": "creator",
     "profile": { "displayName": "DJ User" }
   }
   │
   ▼
2. AuthController.register()
   - Valida schema con Zod
   - Extrae datos del request
   │
   ▼
3. AuthService.register()
   - Orquesta el use case
   - Inyecta dependencias
   │
   ▼
4. RegisterUser.execute()
   ┌─────────────────────────────────────┐
   │ DOMAIN LOGIC (Pure Business Logic)  │
   │                                      │
   │ ✓ Validate email format              │
   │ ✓ Validate password complexity       │
   │ ✓ Check if user exists               │
   │   └─→ userRepository.findByEmail()   │
   │       └─→ PrismaUserRepository       │
   │           └─→ prisma.user.findUnique │
   │                                      │
   │ ✓ Hash password                      │
   │   └─→ passwordService.hash()         │
   │       └─→ BcryptPasswordService      │
   │           └─→ bcrypt.hash()          │
   │                                      │
   │ ✓ Create user + profile              │
   │   └─→ userRepository.create()        │
   │       └─→ PrismaUserRepository       │
   │           └─→ prisma.$transaction    │
   │                                      │
   │ ✓ Generate JWT token                 │
   │   └─→ tokenService.generate()        │
   │       └─→ JwtTokenService            │
   │           └─→ jwt.sign()             │
   └─────────────────────────────────────┘
   │
   ▼
5. Return AuthResult
   {
     "token": "eyJhbGc...",
     "expiresAt": "2026-02-21T...",
     "user": { ... },
     "profile": { ... }
   }
   │
   ▼
6. HTTP Response
   201 Created
   {
     "status": "success",
     "data": { ... }
   }
```

## Dependencias

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY FLOW                               │
└─────────────────────────────────────────────────────────────────┘

HTTP Layer
    │
    │ depends on
    ▼
Application Layer
    │
    │ depends on
    ▼
Domain Layer (Interfaces/Ports)
    ▲
    │ implemented by
    │
Infrastructure Layer (Adapters)
    │
    │ depends on
    ▼
External Systems (Prisma, JWT, Bcrypt)


IMPORTANT: Domain Layer NEVER depends on Infrastructure!
           Infrastructure implements Domain interfaces.
           This is "Dependency Inversion Principle" (SOLID)
```

## Ventajas Visualizadas

### Testabilidad

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIT TEST                                     │
│                                                                  │
│  Test: RegisterUser Use Case                                    │
│                                                                  │
│  ┌──────────────┐                                               │
│  │ RegisterUser │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         │ uses                                                   │
│         ▼                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Mock User   │  │  Mock Token  │  │ Mock Password│         │
│  │  Repository  │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ✓ No database needed                                           │
│  ✓ Fast execution                                               │
│  ✓ Isolated testing                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Flexibilidad

```
┌─────────────────────────────────────────────────────────────────┐
│              SWAP IMPLEMENTATIONS                                │
│                                                                  │
│  Domain Layer (Unchanged)                                       │
│  ┌──────────────────┐                                           │
│  │ IUserRepository  │ ← Interface stays the same                │
│  └──────────────────┘                                           │
│         ▲                                                        │
│         │ implements                                             │
│         │                                                        │
│  ┌──────┴───────┬──────────────┬──────────────┐                │
│  │              │              │              │                │
│  ▼              ▼              ▼              ▼                │
│  Prisma      TypeORM       MongoDB      InMemory               │
│  Adapter     Adapter       Adapter      Adapter                │
│                                                                  │
│  ✓ Easy to switch databases                                     │
│  ✓ No changes to business logic                                 │
│  ✓ Just change adapter in DI                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Reusabilidad

```
┌─────────────────────────────────────────────────────────────────┐
│           MULTIPLE ENTRY POINTS                                  │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   REST   │  │ GraphQL  │  │   gRPC   │  │   CLI    │       │
│  │   API    │  │  Server  │  │  Server  │  │  Tool    │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │               │
│       └─────────────┼─────────────┼─────────────┘               │
│                     │             │                             │
│                     ▼             ▼                             │
│              ┌──────────────────────┐                           │
│              │   RegisterUser       │                           │
│              │   (Use Case)         │                           │
│              └──────────────────────┘                           │
│                                                                  │
│  ✓ Same business logic for all interfaces                       │
│  ✓ Easy to add new entry points                                 │
│  ✓ Consistent behavior everywhere                               │
└─────────────────────────────────────────────────────────────────┘
```

## Comparación: Antes vs Después

### ANTES (Layered Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│  Controller                                                      │
│      │                                                           │
│      ▼                                                           │
│  Service ──────────────┐                                        │
│      │                 │                                        │
│      │  ┌──────────────┼──────────────┐                        │
│      │  │              │              │                        │
│      ▼  ▼              ▼              ▼                        │
│   Prisma           JWT            Bcrypt                        │
│                                                                  │
│  Problems:                                                       │
│  ❌ Service tightly coupled to Prisma                           │
│  ❌ Hard to test (needs real database)                          │
│  ❌ Business logic mixed with infrastructure                    │
│  ❌ Can't easily swap implementations                           │
└─────────────────────────────────────────────────────────────────┘
```

### DESPUÉS (Hexagonal Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│  Controller                                                      │
│      │                                                           │
│      ▼                                                           │
│  AuthService (DI)                                               │
│      │                                                           │
│      ▼                                                           │
│  Use Case ──────────────┐                                       │
│      │                  │                                       │
│      │  ┌───────────────┼───────────────┐                      │
│      │  │               │               │                      │
│      ▼  ▼               ▼               ▼                      │
│  IUserRepo          ITokenSvc      IPasswordSvc                │
│      ▲                  ▲               ▲                      │
│      │                  │               │                      │
│      │  ┌───────────────┼───────────────┘                      │
│      │  │               │                                       │
│      ▼  ▼               ▼                                       │
│   Prisma            JWT            Bcrypt                       │
│   Adapter         Adapter         Adapter                       │
│                                                                  │
│  Benefits:                                                       │
│  ✅ Use case independent of infrastructure                      │
│  ✅ Easy to test (mock interfaces)                              │
│  ✅ Business logic pure and clear                               │
│  ✅ Easy to swap implementations                                │
└─────────────────────────────────────────────────────────────────┘
```
