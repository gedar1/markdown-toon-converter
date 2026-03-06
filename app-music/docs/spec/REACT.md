# Especificación: React / TypeScript

## Estructura de Carpetas

```
src/
├── components/      # Componentes reutilizables
├── pages/          # Páginas/vistas
├── hooks/          # Custom hooks
├── services/       # Servicios (API calls, etc)
├── types/          # Tipos TypeScript
├── utils/          # Funciones utilitarias
├── styles/         # Estilos globales
└── context/        # Context API
```

## Convenciones de Nombres

- **Componentes**: PascalCase → `UserCard.tsx`, `LoginForm.tsx`
- **Hooks**: camelCase con prefijo `use` → `useAuth.ts`, `useFetch.ts`
- **Archivos**: Mismo nombre que el componente/hook principal
- **Props interfaces**: `ComponentNameProps` → `UserCardProps`
- **Funciones**: camelCase → `formatDate()`, `validateEmail()`

## Patrones de Código

### Componentes Funcionales

```typescript
interface UserCardProps {
  userId: string;
  onDelete?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ userId, onDelete }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Cargar usuario
  }, [userId]);

  return <div>{user?.name}</div>;
};
```

### Custom Hooks

```typescript
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, login };
};
```

### Servicios API

```typescript
export const userService = {
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (data: CreateUserDTO) => api.post('/users', data),
  updateUser: (id: string, data: UpdateUserDTO) => api.put(`/users/${id}`, data),
};
```

### Tipos

```typescript
// types/User.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface CreateUserDTO {
  email: string;
  name: string;
}
```

## Dependencias Principales

- `react` - Framework
- `react-router-dom` - Routing
- `axios` o `fetch` - HTTP client
- `typescript` - Tipado
- `@testing-library/react` - Testing

## Mejores Prácticas

- Componentes pequeños y reutilizables
- Props bien tipadas
- Usar hooks en lugar de clases
- Memoizar componentes si es necesario (`React.memo`)
- Separar lógica en custom hooks
- Manejo de errores en servicios

## Ejemplo Mínimo

```typescript
// types/User.ts
export interface User {
  id: string;
  name: string;
}

// services/userService.ts
export const userService = {
  getUser: (id: string) => fetch(`/api/users/${id}`).then(r => r.json()),
};

// hooks/useUser.ts
export const useUser = (id: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getUser(id).then(setUser).finally(() => setLoading(false));
  }, [id]);

  return { user, loading };
};

// components/UserProfile.tsx
export const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const { user, loading } = useUser(userId);

  if (loading) return <div>Cargando...</div>;
  return <div>{user?.name}</div>;
};
```

## Notas Importantes

- Siempre tipificar props e interfaces
- Usar `React.FC` para componentes funcionales
- Evitar props drilling (usar Context si es necesario)
- Manejar estados de carga y error
- Limpiar efectos (return en useEffect)
