# Arquitectura Hexagonal - Módulo Auth

## Descripción

El módulo de autenticación ha sido refactorizado a **Arquitectura Hexagonal (Ports & Adapters)** para mejorar la testabilidad, mantenibilidad y flexibilidad del código.

## Estructura

```
app-music/src/
├── domain/                          # DOMINIO - Lógica de negocio pura
│   └── auth/
│       ├── repositories/            # PUERTOS (interfaces)
│       │   ├── IUserRepository.ts
│       │   ├── ITokenService.ts
│       │   └── IPasswordService.ts
│       └── use-cases/               # Casos de uso
│           ├── RegisterUser.ts
│           ├── LoginUser.ts
│           ├── ValidateToken.ts
│           └── ChangePassword.ts
│
├── application/                     # APLICACIÓN - Orquestación
│   └── auth/
│       └── AuthService.ts           # Orquesta use cases + DI
│
├── infrastructure/                  # INFRAESTRUCTURA - Adaptadores
│   ├── persistence/
│   │   └── PrismaUserRepository.ts  # Implementa IUserRepository
│   └── services/
│       ├── JwtTokenService.ts       # Implementa ITokenService
│       └── BcryptPasswordService.ts # Implementa IPasswordService
│
└── modules/                         # HTTP Layer (Controllers, Routes)
    └── auth/
        ├── auth.controller.ts       # Maneja HTTP requests
        ├── auth.routes.ts           # Define rutas
        └── auth.middleware.ts       # Middleware de autenticación
```

## Capas

### 1. Domain Layer (Dominio)

**Responsabilidad:** Contiene la lógica de negocio pura, sin dependencias de infraestructura.

**Componentes:**

#### Repositories (Puertos)

Interfaces que definen contratos que la infraestructura debe implementar:

- `IUserRepository`: Operaciones de persistencia de usuarios
- `ITokenService`: Generación y validación de tokens
- `IPasswordService`: Hash y validación de contraseñas

#### Use Cases (Casos de Uso)

Lógica de negocio específica para cada operación:

- `RegisterUser`: Registrar nuevo usuario
- `LoginUser`: Autenticar usuario
- `ValidateToken`: Validar token JWT
- `ChangePassword`: Cambiar contraseña

**Características:**

- ✅ Sin dependencias de frameworks (Express, Prisma, etc.)
- ✅ Fácil de testear (mock de interfaces)
- ✅ Reutilizable en diferentes contextos

**Ejemplo:**

```typescript
// Use case puro - solo lógica de negocio
export class RegisterUser {
  constructor(
    private userRepository: IUserRepository,  // Puerto
    private passwordService: IPasswordService, // Puerto
    private tokenService: ITokenService       // Puerto
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // Validaciones
    if (!validateEmail(input.email)) {
      throw new ValidationError('Invalid email');
    }

    // Lógica de negocio
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('User exists');
    }

    // Crear usuario
    const passwordHash = await this.passwordService.hash(input.password);
    const result = await this.userRepository.create({...});

    // Generar token
    const token = this.tokenService.generate({...});

    return { token, user: result.user, profile: result.profile };
  }
}
```

### 2. Application Layer (Aplicación)

**Responsabilidad:** Orquesta los use cases y maneja la inyección de dependencias.

**Componentes:**

- `AuthService`: Servicio de aplicación que:
  - Crea instancias de los adaptadores (Prisma, JWT, Bcrypt)
  - Inyecta dependencias en los use cases
  - Expone métodos simples para el controller

**Ejemplo:**

```typescript
export class AuthService {
  private registerUser: RegisterUser;
  private loginUser: LoginUser;

  constructor() {
    // Crear adaptadores (implementaciones concretas)
    const userRepository = new PrismaUserRepository();
    const tokenService = new JwtTokenService();
    const passwordService = new BcryptPasswordService();

    // Inyectar en use cases
    this.registerUser = new RegisterUser(userRepository, passwordService, tokenService);
    this.loginUser = new LoginUser(userRepository, passwordService, tokenService);
  }

  async register(input: RegisterUserInput) {
    return await this.registerUser.execute(input);
  }

  async login(input: LoginUserInput) {
    return await this.loginUser.execute(input);
  }
}
```

### 3. Infrastructure Layer (Infraestructura)

**Responsabilidad:** Implementaciones concretas de los puertos (adaptadores).

**Componentes:**

#### Persistence

- `PrismaUserRepository`: Implementa `IUserRepository` usando Prisma ORM

#### Services

- `JwtTokenService`: Implementa `ITokenService` usando JWT
- `BcryptPasswordService`: Implementa `IPasswordService` usando Bcrypt

**Características:**

- ✅ Implementaciones intercambiables
- ✅ Fácil cambiar de tecnología (Prisma → TypeORM)
- ✅ Aisladas del dominio

**Ejemplo:**

```typescript
// Adaptador concreto
export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    // Implementación específica de Prisma
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async create(data: CreateUserData): Promise<{user: User, profile: UserProfile}> {
    // Implementación con transacciones de Prisma
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({...});
      const profile = await tx.creatorProfile.create({...});
      return { user, profile };
    });
  }
}
```

### 4. HTTP Layer (Presentación)

**Responsabilidad:** Maneja requests HTTP y respuestas.

**Componentes:**

- `auth.controller.ts`: Controladores Express
- `auth.routes.ts`: Definición de rutas
- `auth.middleware.ts`: Middleware de autenticación

**Ejemplo:**

```typescript
export class AuthController {
  async register(req: Request, res: Response) {
    const data = validateSchema(registerSchema, req.body);

    // Llama al servicio de aplicación
    const result = await authService.register(data);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  }
}
```

## Flujo de Datos

```
HTTP Request
    ↓
Controller (HTTP Layer)
    ↓
AuthService (Application Layer)
    ↓
Use Case (Domain Layer)
    ↓
Repository Interface (Port)
    ↓
Repository Implementation (Adapter)
    ↓
Database (Prisma/PostgreSQL)
```

## Ventajas de esta Arquitectura

### 1. Testabilidad

```typescript
// Test unitario del use case sin base de datos
describe('RegisterUser', () => {
  it('should register a new user', async () => {
    // Mock de los puertos
    const mockUserRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({...})
    };
    const mockPasswordService = {
      hash: jest.fn().mockResolvedValue('hashed'),
      validate: jest.fn().mockReturnValue(true)
    };
    const mockTokenService = {
      generate: jest.fn().mockReturnValue('token123')
    };

    // Crear use case con mocks
    const registerUser = new RegisterUser(
      mockUserRepo,
      mockPasswordService,
      mockTokenService
    );

    // Ejecutar
    const result = await registerUser.execute({
      email: 'test@example.com',
      password: 'Password123',
      userType: 'creator',
      profile: { displayName: 'Test' }
    });

    // Verificar
    expect(result.token).toBe('token123');
    expect(mockUserRepo.create).toHaveBeenCalled();
  });
});
```

### 2. Flexibilidad

Cambiar de Prisma a TypeORM:

```typescript
// Solo crear nuevo adaptador
export class TypeOrmUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findOne({ where: { email } });
  }
  // ... resto de métodos
}

// Cambiar en AuthService
const userRepository = new TypeOrmUserRepository(); // ← Solo esto cambia
```

### 3. Independencia

- El dominio no conoce Express, Prisma, JWT, Bcrypt
- Puedes usar los use cases en CLI, GraphQL, gRPC, etc.
- Fácil migrar a microservicios

### 4. Mantenibilidad

- Lógica de negocio clara y centralizada
- Fácil encontrar y modificar código
- Separación de responsabilidades

## Comparación: Antes vs Después

### Antes (Layered)

```typescript
// auth.service.ts - Todo mezclado
export class AuthService {
  async register(credentials: UserCredentials) {
    // Validación + lógica + persistencia mezclados
    if (!validateEmail(credentials.email)) throw new Error();
    const user = await prisma.user.create({...}); // ← Dependencia directa
    const token = generateToken({...});
    return { user, token };
  }
}
```

**Problemas:**

- ❌ Difícil testear (necesitas base de datos)
- ❌ Acoplado a Prisma
- ❌ Lógica de negocio mezclada con infraestructura

### Después (Hexagonal)

```typescript
// RegisterUser.ts - Solo lógica de negocio
export class RegisterUser {
  constructor(
    private userRepository: IUserRepository, // ← Interface
    private passwordService: IPasswordService,
    private tokenService: ITokenService
  ) {}

  async execute(input: RegisterUserInput) {
    // Solo lógica de negocio
    if (!validateEmail(input.email)) throw new Error();
    const user = await this.userRepository.create({...}); // ← Interface
    const token = this.tokenService.generate({...});
    return { user, token };
  }
}
```

**Ventajas:**

- ✅ Fácil testear (mock de interfaces)
- ✅ Desacoplado de infraestructura
- ✅ Lógica de negocio clara

## Próximos Pasos

### Migrar otros módulos:

1. ✅ Auth (completado)
2. ⏳ Users
3. ⏳ Content
4. ⏳ Streaming
5. ⏳ Live
6. ⏳ Access

### Mejoras adicionales:

- [ ] Agregar tests unitarios para use cases
- [ ] Agregar tests de integración para adaptadores
- [ ] Implementar CQRS (Command Query Responsibility Segregation)
- [ ] Agregar Event Sourcing para auditoría
- [ ] Implementar Domain Events

## Recursos

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Ports and Adapters Pattern](https://herbertograca.com/2017/09/14/ports-adapters-architecture/)
