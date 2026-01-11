# Tài liệu kiến trúc API - NestJS

## 📁 Kiến trúc thư mục

```
api/
├── src/
│   ├── main.ts                          # Entry point, setup global prefix /api
│   ├── app.module.ts                    # Root module
│   │
│   ├── config/                          # Configuration files
│   │   ├── configuration.ts             # App configuration
│   │   ├── typeorm.config.ts           # TypeORM config
│   │   └── jwt.config.ts               # JWT config (shared)
│   │
│   ├── common/                          # Shared utilities
│   │   ├── decorators/                  # Custom decorators
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── current-admin.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── guards/                      # Shared guards
│   │   ├── interceptors/                # Shared interceptors
│   │   │   ├── transform.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/                       # Shared pipes
│   │   └── filters/                     # Exception filters
│   │
│   ├── entities/                        # Database entities
│   │   ├── index.ts                     # Export all entities
│   │   ├── user.entity.ts              # User table (for user site)
│   │   └── admin.entity.ts             # Admin table (for admin site)
│   │
│   ├── modules/                         # Feature modules
│   │   │
│   │   ├── user/                        # USER SITE (path: /api)
│   │   │   ├── auth/                    # User authentication
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.controller.ts   # Routes: /api/auth/*
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── local.strategy.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   └── local-auth.guard.ts
│   │   │   │   └── dto/
│   │   │   │       ├── login.dto.ts
│   │   │   │       └── register.dto.ts
│   │   │   │
│   │   │   └── profile/                 # User profile management
│   │   │       ├── profile.module.ts
│   │   │       ├── profile.service.ts
│   │   │       ├── profile.controller.ts # Routes: /api/profile/*
│   │   │       └── dto/
│   │   │
│   │   └── admin/                       # ADMIN SITE (path: /api/admin)
│   │       ├── admin.module.ts          # Admin root module
│   │       │
│   │       ├── auth/                    # Admin authentication
│   │       │   ├── auth.module.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── auth.controller.ts   # Routes: /api/admin/auth/*
│   │       │   ├── strategies/
│   │       │   │   ├── admin-jwt.strategy.ts
│   │       │   │   └── admin-local.strategy.ts
│   │       │   ├── guards/
│   │       │   │   ├── admin-jwt-auth.guard.ts
│   │       │   │   └── admin-local-auth.guard.ts
│   │       │   └── dto/
│   │       │       └── admin-login.dto.ts
│   │       │
│   │       └── users/                   # Admin manage users
│   │           ├── users.module.ts
│   │           ├── users.service.ts
│   │           └── users.controller.ts  # Routes: /api/admin/users/*
│   │
│   └── database/                        # Database related
│       ├── migrations/                  # TypeORM migrations
│       └── seeds/                       # Database seeders
│
├── test/                                # E2E tests
├── .env                                 # Environment variables
├── .env.example                         # Example env file
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## � Luồng hoạt động của Request (Request Lifecycle)

Khi một request được gửi đến hệ thống, nó sẽ đi qua các bước sau:

### **1. Client gửi Request**
```
Client → HTTP Request → Server (localhost:3000)
Example: POST http://localhost:3000/api/auth/login
```

### **2. Main.ts - Entry Point**
- Request đầu tiên vào `main.ts`
- **Global Prefix** `/api` được apply cho tất cả routes
- **Global Interceptors** được khởi tạo:
  - `LoggingInterceptor` - Bắt đầu log thời gian request
  - `TransformInterceptor` - Chuẩn bị format response
- **Global Validation Pipe** validate input data

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Set global prefix
  app.setGlobalPrefix('api');
  
  // 2. Apply global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),      // Log request
    new TransformInterceptor(),    // Format response
  );
  
  // 3. Apply global validation
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
}
```

### **3. Routing - Tìm Controller phù hợp**
NestJS routing system tìm controller và method handler phù hợp:

**Ví dụ User Login Request:**
```
POST /api/auth/login
↓
Route matching: /api/auth/login
↓
Found: UserAuthController.login()
```

**Ví dụ Admin Login Request:**
```
POST /api/admin/auth/login
↓
Route matching: /api/admin/auth/login
↓
Found: AdminAuthController.login()
```

### **4. Guards - Kiểm tra Authentication/Authorization**

**4.1. Public Routes (không cần auth):**
```typescript
@Post('register')
@Public()  // ← Decorator đánh dấu route public
async register(@Body() dto: RegisterDto) {
  // Bỏ qua guards, thực thi trực tiếp
}
```

**4.2. Protected Routes (cần auth):**
```typescript
// User protected route
@Get('profile')
@UseGuards(JwtAuthGuard)  // ← Guard kiểm tra JWT
getProfile(@CurrentUser() user: User) {
  // Guard chạy trước method này
}

// Admin protected route
@Get('admin/users')
@UseGuards(AdminJwtAuthGuard)  // ← Guard riêng cho admin
getUsers(@CurrentAdmin() admin: Admin) {
  // AdminGuard chạy trước
}
```

**Flow trong Guard:**
```
Request → Guard.canActivate()
         ↓
         JWT Strategy.validate()
         ↓
         - Extract token from header
         - Verify token với secret key
         - Decode payload (userId/adminId)
         - Query database để lấy user/admin
         - Attach user/admin vào request object
         ↓
         return true/false
         ↓
If true → Tiếp tục đến Controller
If false → Throw UnauthorizedException (401)
```

### **5. Strategies - Validate Credentials**

**5.1. Local Strategy (Login với email/password hoặc username/password):**
```typescript
// User LocalStrategy
POST /api/auth/login
↓
LocalAuthGuard triggers LocalStrategy.validate()
↓
- Nhận email + password từ request body
- Query database tìm user by email
- So sánh password với bcrypt.compare()
- Nếu đúng: return user object
- Nếu sai: throw UnauthorizedException
↓
Request.user = validated user
```

**5.2. JWT Strategy (Access protected routes với token):**
```typescript
// User JwtStrategy
GET /api/profile
Headers: Authorization: Bearer eyJhbGc...
↓
JwtAuthGuard triggers JwtStrategy.validate()
↓
- Extract token từ Authorization header
- Verify token với USER_JWT_SECRET
- Decode payload: { userId: 1, email: "user@example.com" }
- Query database: findOne({ where: { id: payload.userId } })
- Return user object
↓
Request.user = authenticated user
```

**5.3. Admin JWT Strategy:**
```typescript
// Admin JwtStrategy
GET /api/admin/users
Headers: Authorization: Bearer eyJhbGc...
↓
AdminJwtAuthGuard triggers AdminJwtStrategy.validate()
↓
- Extract token từ Authorization header
- Verify token với ADMIN_JWT_SECRET (khác với USER_JWT_SECRET!)
- Decode payload: { adminId: 1, username: "admin" }
- Query database: findOne({ where: { id: payload.adminId } })
- Return admin object
↓
Request.admin = authenticated admin
```

### **6. Decorators - Extract Data**

Sau khi Guards/Strategies chạy xong, decorators extract data từ request:

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: User) {
  // @CurrentUser() decorator tự động lấy request.user
  // user = { id: 1, email: "user@example.com", firstName: "John" }
  console.log(user.id);  // 1
}

@Get('admin/users')
@UseGuards(AdminJwtAuthGuard)
getUsers(@CurrentAdmin() admin: Admin) {
  // @CurrentAdmin() decorator tự động lấy request.admin
  // admin = { id: 1, username: "admin", role: "super_admin" }
  console.log(admin.username);  // "admin"
}
```

### **7. Controller Method - Xử lý Request**

Controller nhận data và gọi Service:

```typescript
@Post('auth/login')
async login(@Body() loginDto: LoginDto) {
  // 1. Nhận DTO đã được validate
  // 2. Gọi service xử lý business logic
  return this.authService.login(loginDto);
}
```

### **8. Service Layer - Business Logic**

Service thực hiện logic nghiệp vụ:

```typescript
// auth.service.ts
async login(loginDto: LoginDto) {
  // 1. Tìm user trong database
  const user = await this.userRepository.findOne({
    where: { email: loginDto.email }
  });
  
  // 2. Validate password
  const isValid = await user.validatePassword(loginDto.password);
  if (!isValid) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  // 3. Generate JWT token
  const payload = { userId: user.id, email: user.email };
  const accessToken = await this.jwtService.signAsync(payload, {
    secret: this.configService.get('USER_JWT_SECRET'),
    expiresIn: '7d'
  });
  
  // 4. Return response
  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName
    }
  };
}
```

### **9. Database - TypeORM Query**

Service gọi TypeORM repository để query database:

```typescript
// Query user
const user = await this.userRepository.findOne({
  where: { email: 'user@example.com' }
});

// Query admin
const admin = await this.adminRepository.findOne({
  where: { username: 'admin' }
});

// Query với relations
const user = await this.userRepository.findOne({
  where: { id: 1 },
  relations: ['orders', 'profile']  // (nếu có)
});
```

**Database Connection:**
```
Service → TypeORM Repository → PostgreSQL
         ↓
         SELECT * FROM users WHERE email = 'user@example.com'
         ↓
         Return entity object
```

### **10. Response - Trả về Controller**

Service trả kết quả về Controller:

```typescript
return {
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: 1,
    email: "user@example.com",
    firstName: "John"
  }
};
```

### **11. Transform Interceptor - Format Response**

Interceptor tự động wrap response vào format chuẩn:

```typescript
// Original response from controller
{
  accessToken: "eyJhbGc...",
  user: { id: 1, email: "user@example.com" }
}

// ↓ TransformInterceptor processes ↓

// Formatted response
{
  statusCode: 200,
  message: "Success",
  data: {
    accessToken: "eyJhbGc...",
    user: { id: 1, email: "user@example.com" }
  },
  timestamp: "2026-01-11T10:30:00.000Z"
}
```

### **12. Logging Interceptor - Ghi Log**

LoggingInterceptor ghi log thời gian xử lý request:

```
[HTTP] POST /api/auth/login 200 - 152ms
[HTTP] GET /api/profile 200 - 45ms
[HTTP] PUT /api/profile 200 - 89ms
[HTTP] POST /api/admin/auth/login 200 - 167ms
[HTTP] GET /api/admin/users 200 - 78ms
```

### **13. Client nhận Response**

Client nhận JSON response đã được format:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John"
    }
  },
  "timestamp": "2026-01-11T10:30:00.000Z"
}
```

---

## 📊 Sơ đồ tổng quan Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│                  (Browser/Mobile App)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP Request
                         │ POST /api/auth/login
                         │ { email, password }
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MAIN.TS (Entry)                             │
│  - Apply global prefix: /api                                     │
│  - Initialize global interceptors                                │
│  - Initialize global pipes                                       │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│               LOGGING INTERCEPTOR (Before)                       │
│  - Log: [HTTP] POST /api/auth/login - Started                   │
│  - Record start time                                             │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTING SYSTEM                                │
│  - Match route: POST /api/auth/login                             │
│  - Find controller: UserAuthController.login()                   │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  VALIDATION PIPE                                 │
│  - Validate DTO: LoginDto                                        │
│  - Check @IsEmail(), @IsNotEmpty(), etc.                         │
│  - If invalid → throw BadRequestException                        │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      GUARDS                                      │
│  - Check if route is @Public()                                   │
│  - If protected → Run JwtAuthGuard or AdminJwtAuthGuard          │
│  - Trigger Strategy.validate()                                   │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STRATEGIES                                    │
│  User: JwtStrategy / LocalStrategy                               │
│  Admin: AdminJwtStrategy / AdminLocalStrategy                    │
│  - Validate credentials                                          │
│  - Query database                                                │
│  - Attach user/admin to request                                  │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DECORATORS                                    │
│  @CurrentUser() or @CurrentAdmin()                               │
│  - Extract user/admin from request                               │
│  - Pass to controller method parameter                           │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   CONTROLLER METHOD                              │
│  async login(@Body() dto: LoginDto) {                            │
│    return this.authService.login(dto);                           │
│  }                                                                │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
│  - Business logic                                                │
│  - Validate credentials                                          │
│  - Generate JWT token                                            │
│  - Return data                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                 DATABASE (TypeORM)                               │
│  - Query: SELECT * FROM users WHERE email = ?                    │
│  - Return User entity                                            │
│  - PostgreSQL database                                           │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                SERVICE RETURNS DATA                              │
│  { accessToken, user: {...} }                                    │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│             TRANSFORM INTERCEPTOR (After)                        │
│  - Wrap response in standard format                              │
│  - Add statusCode, message, timestamp                            │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              LOGGING INTERCEPTOR (After)                         │
│  - Calculate elapsed time                                        │
│  - Log: [HTTP] POST /api/auth/login 200 - 152ms                 │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  RESPONSE TO CLIENT                              │
│  {                                                               │
│    "statusCode": 200,                                            │
│    "message": "Success",                                         │
│    "data": { "accessToken": "...", "user": {...} },             │
│    "timestamp": "2026-01-11T10:30:00.000Z"                       │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔀 So sánh luồng User vs Admin Request

### **User Request Flow:**
```
POST /api/auth/login
  ↓
LocalAuthGuard → LocalStrategy (users table)
  ↓
Generate JWT with USER_JWT_SECRET
  ↓
Return { accessToken, user }

GET /api/profile
Headers: Bearer <user_token>
  ↓
JwtAuthGuard → JwtStrategy (USER_JWT_SECRET)
  ↓
Query users table
  ↓
@CurrentUser() decorator
  ↓
Return user profile
```

### **Admin Request Flow:**
```
POST /api/admin/auth/login
  ↓
AdminLocalAuthGuard → AdminLocalStrategy (admins table)
  ↓
Generate JWT with ADMIN_JWT_SECRET
  ↓
Return { accessToken, admin }

GET /api/admin/users
Headers: Bearer <admin_token>
  ↓
AdminJwtAuthGuard → AdminJwtStrategy (ADMIN_JWT_SECRET)
  ↓
Query admins table
  ↓
@CurrentAdmin() decorator
  ↓
Return users list
```

**Điểm khác biệt:**
- ✅ User và Admin dùng **khác table** (users vs admins)
- ✅ User và Admin dùng **khác JWT secret** (USER_JWT_SECRET vs ADMIN_JWT_SECRET)
- ✅ User và Admin dùng **khác guards** (JwtAuthGuard vs AdminJwtAuthGuard)
- ✅ User và Admin dùng **khác strategies** (JwtStrategy vs AdminJwtStrategy)
- ✅ User và Admin dùng **khác decorators** (@CurrentUser vs @CurrentAdmin)
- ⚠️ **Token không thể dùng chéo**: Admin token không dùng được cho user routes và ngược lại

---

## �🔐 Routing Structure

### **User Site** (Dành cho end-users)
- **Base Path**: `/api`
- **Authentication**: Sử dụng table `users`
- **JWT Secret**: `USER_JWT_SECRET`
- **Routes**:
  - `POST /api/auth/register` - Đăng ký user mới
  - `POST /api/auth/login` - Đăng nhập user
  - `GET /api/profile` - Xem profile (protected)
  - `PUT /api/profile` - Cập nhật profile (protected)

### **Admin Site** (Dành cho quản trị viên)
- **Base Path**: `/api/admin`
- **Authentication**: Sử dụng table `admins`
- **JWT Secret**: `ADMIN_JWT_SECRET`
- **Routes**:
  - `POST /api/admin/auth/login` - Đăng nhập admin
  - `GET /api/admin/users` - Xem danh sách users (protected)

---

## 🗄️ Database Structure

### Shared Database
Cả User Site và Admin Site đều sử dụng **chung 1 database** nhưng **khác table authentication**:

```sql
-- Table cho User Site
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  phone VARCHAR(20),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Table cho Admin Site
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  permissions TEXT[],
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

---

## 🔑 Authentication Strategy

### **User Authentication**
```typescript
// User login flow
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "123456"
}

// Response
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John"
  }
}

// Protected routes - Attach token
GET /api/profile
Headers: Authorization: Bearer eyJhbGc...
```

### **Admin Authentication**
```typescript
// Admin login flow
POST /api/admin/auth/login
{
  "username": "admin",
  "password": "admin123"
}

// Response
{
  "accessToken": "eyJhbGc...",
  "admin": {
    "id": 1,
    "username": "admin",
    "role": "super_admin"
  }
}

// Protected routes - Attach token
GET /api/admin/users
Headers: Authorization: Bearer eyJhbGc...
```

### **Strategies & Guards**

**User Side:**
- `JwtStrategy` - Validate user JWT tokens
- `LocalStrategy` - Validate email/password
- `JwtAuthGuard` - Protect user routes
- Sử dụng decorator: `@CurrentUser()`

**Admin Side:**
- `AdminJwtStrategy` - Validate admin JWT tokens
- `AdminLocalStrategy` - Validate username/password
- `AdminJwtAuthGuard` - Protect admin routes
- Sử dụng decorator: `@CurrentAdmin()`

---

## 🎨 Decorators (Bộ trang trí)

Decorators là các annotation để thêm metadata hoặc modify behavior của classes, methods, properties.

### **1. Custom Parameter Decorators**

#### `@CurrentUser()` - Lấy thông tin user hiện tại
```typescript
// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // User được attach bởi JWT strategy
  },
);

// Sử dụng trong controller
@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return user; // Tự động lấy user từ request
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.profileService.update(user.id, updateDto);
  }
}
```

#### `@CurrentAdmin()` - Lấy thông tin admin hiện tại
```typescript
// src/common/decorators/current-admin.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.admin; // Admin được attach bởi AdminJWT strategy
  },
);

// Sử dụng trong admin controller
@Controller('admin/users')
export class AdminUsersController {
  @Get()
  @UseGuards(AdminJwtAuthGuard)
  getAllUsers(@CurrentAdmin() admin: Admin) {
    console.log(`Admin ${admin.username} is viewing users`);
    return this.usersService.findAll();
  }
}
```

### **2. Method Decorators**

#### `@Public()` - Đánh dấu route không cần authentication
```typescript
// src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Sử dụng
@Controller('profile')
export class ProfileController {
  @Get('public-info')
  @Public() // Route này không cần đăng nhập
  getPublicInfo() {
    return { info: 'Public information' };
  }

  @Get()
  @UseGuards(JwtAuthGuard) // Route này cần đăng nhập
  getProfile(@CurrentUser() user: User) {
    return this.profileService.getProfile(user.id);
  }
}
```

#### `@Roles()` - Kiểm tra quyền truy cập
```typescript
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Sử dụng
@Controller('admin/settings')
export class SettingsController {
  @Get()
  @Roles('super_admin', 'admin') // Chỉ super_admin và admin mới vào được
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  getSettings() {
    return this.settingsService.findAll();
  }

  @Put()
  @Roles('super_admin') // Chỉ super_admin mới sửa được
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  updateSettings(@Body() updateDto: UpdateSettingsDto) {
    return this.settingsService.update(updateDto);
  }
}
```

---

## 🔄 Interceptors (Bộ chặn)

Interceptors là middleware để can thiệp vào request/response cycle, chạy **trước** và **sau** method handler.

### **1. Transform Interceptor** - Format response data

```typescript
// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: 'Success',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// Sử dụng - Apply global trong main.ts
app.useGlobalInterceptors(new TransformInterceptor());

// Hoặc apply cho specific controller/method
@Controller('users')
@UseInterceptors(TransformInterceptor)
export class UsersController {
  @Get()
  findAll() {
    return [{ id: 1, name: 'John' }];
  }
  // Response tự động format thành:
  // {
  //   "statusCode": 200,
  //   "message": "Success",
  //   "data": [{ "id": 1, "name": "John" }],
  //   "timestamp": "2026-01-10T10:30:00.000Z"
  // }
}
```

### **2. Logging Interceptor** - Ghi log request/response

```typescript
// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this.logger.log(
          `${method} ${url} ${response.statusCode} - ${delay}ms`,
        );
      }),
    );
  }
}

// Sử dụng - Apply global
app.useGlobalInterceptors(new LoggingInterceptor());

// Output:
// [HTTP] POST /api/auth/login 200 - 152ms
// [HTTP] GET /api/products 200 - 45ms
// [HTTP] PUT /api/profile 200 - 89ms
```

### **3. Timeout Interceptor** - Timeout cho request

```typescript
// src/common/interceptors/timeout.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000), // 5 seconds
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}

// Sử dụng
@Controller('reports')
export class ReportsController {
  @Get('heavy')
  @UseInterceptors(TimeoutInterceptor)
  async generateReport() {
    // Nếu xử lý quá 5s sẽ throw RequestTimeoutException
    return await this.reportsService.heavyProcess();
  }
}
```

### **4. Cache Interceptor** - Cache response

```typescript
// src/common/interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const key = `${request.method}:${request.url}`;

    const cachedResponse = this.cache.get(key);
    if (cachedResponse) {
      console.log('Returning cached response');
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap((response) => {
        this.cache.set(key, response);
        // Clear cache after 60 seconds
        setTimeout(() => this.cache.delete(key), 60000);
      }),
    );
  }
}

// Sử dụng
@Controller('profile')
export class ProfileController {
  @Get('public-info')
  @UseInterceptors(CacheInterceptor) // Response được cache 60s
  getPublicInfo() {
    return this.profileService.getPublicInfo();
  }
}
```

---

## 📦 Module Organization

### **AppModule** - Root module
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({...}),
    UserAuthModule,
    UserProfileModule,
    AdminModule, // Admin root module
  ],
})
export class AppModule {}
```

### **AdminModule** - Admin root module với prefix
```typescript
@Module({
  imports: [
    AdminAuthModule,
    AdminUsersModule,
  ],
})
@Controller('admin') // Prefix cho tất cả admin routes
export class AdminModule {}
```

---

## 🚀 Deployment & Environment

### **.env file**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=perkx_db

# JWT Secrets (MUST BE DIFFERENT!)
USER_JWT_SECRET=user_secret_key_random_string_here
USER_JWT_EXPIRES_IN=7d

ADMIN_JWT_SECRET=admin_secret_key_different_from_user
ADMIN_JWT_EXPIRES_IN=1d

# App
PORT=3000
NODE_ENV=development
```

---

## 🔧 Best Practices

### 1. **Separation of Concerns**
- User modules và Admin modules hoàn toàn tách biệt
- Mỗi bên có authentication riêng, không dùng chung guards/strategies

### 2. **Security**
- JWT secrets khác nhau cho user và admin
- Password phải hash bằng bcrypt trước khi lưu DB
- Validate input data bằng DTOs và class-validator
- Sử dụng guards để protect routes

### 3. **Code Reusability**
- Shared utilities trong `common/`
- Database entities trong `entities/`
- Config centralized trong `config/`

### 4. **Error Handling**
- Sử dụng Exception Filters để format errors
- Consistent error response format
- Log errors properly

### 5. **Testing**
- Unit tests cho services
- E2E tests cho API endpoints
- Test authentication flows riêng biệt

---

## 📚 API Documentation

### User API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Đăng ký user mới | No |
| POST | /api/auth/login | Đăng nhập user | No |
| GET | /api/profile | Xem profile | Yes |
| PUT | /api/profile | Cập nhật profile | Yes |

### Admin API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/admin/auth/login | Đăng nhập admin | No |
| GET | /api/admin/users | Xem danh sách users | Yes |

---

## 📝 Notes

- Tất cả API endpoints đều return JSON format
- Sử dụng HTTP status codes chuẩn
- Authentication token valid trong thời gian được config trong .env
- Admin có thể quản lý users nhưng users không thể truy cập admin routes
- Database migrations nên được run trước khi start app
- Trong production, set `synchronize: false` trong TypeORM config

---

**Version**: 1.0.0  
**Last Updated**: January 10, 2026
