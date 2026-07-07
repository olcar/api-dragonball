import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UsersService } from 'src/users/users.service';

const TEST_USER = {
  name: 'E2E Test User',
  email: `e2e-${Date.now()}@test.com`,
  password: 'password123',
};

const ADMIN_USER = {
  name: 'E2E Admin User',
  email: `e2e-admin-${Date.now()}@test.com`,
  password: 'password123',
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;
  let userId: number;
  let adminId: number;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    usersService = app.get(UsersService);

    // Register both users upfront so emails exist for duplicate checks
    const userRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(201);
    userId = userRes.body.id;

    const adminRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(ADMIN_USER)
      .expect(201);
    adminId = adminRes.body.id;

    await usersService.update(adminId, { role: 'admin' });
  });

  afterAll(async () => {
    if (userId) await usersService.remove(userId).catch(() => {});
    if (adminId) await usersService.remove(adminId).catch(() => {});
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register user without password in response', async () => {
      const unique = `e2e-fresh-${Date.now()}@test.com`;
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ name: 'Fresh', email: unique, password: 'password123' })
        .expect(201);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toHaveProperty('email', unique);
      expect(res.body).toHaveProperty('role', 'user');

      // clean up
      await usersService.remove(res.body.id).catch(() => {});
    });

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(TEST_USER)
        .expect(400);
    });

    it('should reject invalid input', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ name: 'ab', email: 'bad', password: 'short' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return access_token for test user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('user', TEST_USER.name);
      userToken = res.body.access_token;
    });

    it('should return access_token for admin user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: ADMIN_USER.email, password: ADMIN_USER.password })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      adminToken = res.body.access_token;
    });

    it('should reject wrong email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: TEST_USER.password })
        .expect(401);
    });

    it('should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('GET /api/users/me', () => {
    it('should return current user profile without password', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', userId);
      expect(res.body).toHaveProperty('email', TEST_USER.email);
      expect(res.body).toHaveProperty('role', 'user');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should reject without token', async () => {
      await request(app.getHttpServer()).get('/api/users/me').expect(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update name', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated E2E Name' })
        .expect(200);

      expect(res.body).toHaveProperty('name', 'Updated E2E Name');
      expect(res.body).toHaveProperty('id', userId);
    });

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: ADMIN_USER.email })
        .expect(400);
    });
  });

  describe('Role enforcement', () => {
    it('user is denied from GET /api/users (admin only)', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('admin can access GET /api/users', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const users = res.body as any[];
      expect(users.some((u) => u.id === userId)).toBe(true);
      users.forEach((u) => expect(u).not.toHaveProperty('password'));
    });

    it('user is denied from PATCH /api/users/:id/role', async () => {
      await request(app.getHttpServer())
        .patch(`/api/users/${adminId}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'user' })
        .expect(403);
    });

    it('admin can change user role', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200);

      expect(res.body).toHaveProperty('role', 'admin');
    });

    it('admin cannot self-demote', async () => {
      await request(app.getHttpServer())
        .patch(`/api/users/${adminId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'user' })
        .expect(403);
    });

    it('admin cannot delete own account', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('admin can delete another admin when >1 admin exists', async () => {
      // restore user back to admin to create 2 admin scenario
      await usersService.update(userId, { role: 'admin' });

      await request(app.getHttpServer())
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
