import { ValidationPipe, UnprocessableEntityException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFormatterFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    process.env.PUBLIC_SITE_URL,
    process.env.ADMIN_PANEL_URL,
    'http://localhost:3000',
    'http://localhost:5173',
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const details = errors.map((error) => ({
          field: error.property,
          constraints: error.constraints
            ? Object.values(error.constraints)
            : [],
        }));

        return new UnprocessableEntityException({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed.',
          details,
        });
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFormatterFilter());

  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
}

bootstrap();
