import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { LoginDto, RegisterDto } from '@src/auth/dtos';

describe('App test', () => {
  const url = 'http://localhost:4000';
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
    await app.listen(4000);
    pactum.request.setBaseUrl(url);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Register', () => {
      const dto: RegisterDto = {
        email: 'user@gmail.com',
        password: 'admin@123',
        firstName: 'user',
        lastName: 'test',
      };
      it('should throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should register', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Login', () => {
      it('should login', () => {
        const dto: LoginDto = {
          email: 'user@gmail.com',
          password: 'admin@123',
        };
        return pactum
          .spec()
          .post(`/auth/login`)
          .withBody(dto)
          .expectStatus(200)
          .stores('userToken', 'token');
      });
    });
  });

  describe('User', () => {
    describe('Get profile', () => {
      it('should return profile', () => {
        return pactum
          .spec()
          .get(`/user/profile`)
          .withBearerToken('$S{userToken}')
          .expectStatus(200);
      });
    });

    describe('Update profile', () => {
      it('should update profile', () => {
        return pactum
          .spec()
          .patch('/user/profile')
          .withBearerToken('$S{userToken}')
          .expectStatus(200)
          .expectBody({ message: 'User updated' });
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Add bookmark', () => {
      const dto = {
        title: 'First',
        description: 'lorem ipsum dolor sit amet',
        link: 'https://github.com/vladwulf/nestjs-api-tutorial/blob/main/src/bookmark/bookmark.service.ts',
      };
      it('should throw error for partial fields', () => {
        return pactum
          .spec()
          .post('/bookmark')
          .withBearerToken('$S{userToken}')
          .withBody({
            title: dto.title,
          })
          .expectStatus(400);
      });
      it('should throw error for invalid field', () => {
        return pactum
          .spec()
          .post('/bookmark')
          .withBearerToken('$S{userToken}')
          .withBody({
            link: 'user',
          })
          .expectStatus(400);
      });
      it('should add bookmark', () => {
        return pactum
          .spec()
          .post('/bookmark')
          .withBearerToken('$S{userToken}')
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get all bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withBearerToken('$S{userToken}')
          .expectStatus(200);
      });
    });

    describe('Get bookmark by id', () => {
      it('should throw error', () => {
        return pactum
          .spec()
          .get('/bookmark/{id}')
          .withPathParams('id', '333')
          .withBearerToken('$S{userToken}')
          .expectStatus(400);
      });
      it('should return one bookmark', () => {
        return pactum
          .spec()
          .get('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userToken}')
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .inspect();
      });
    });

    describe('Update bookmark', () => {
      it('should update bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userToken}')
          .expectStatus(200)
          .expectBody({ message: 'Bookmark updated' });
      });
    });

    describe('Delete bookmark', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userToken}')
          .expectStatus(200)
          .expectBody({ message: 'Bookmark deleted' });
      });
    });
  });
});
