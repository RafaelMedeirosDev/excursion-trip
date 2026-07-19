import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

const WEAK_JWT_SECRETS = ["change-me"];

async function bootstrap() {
  if (!process.env.JWT_SECRET || WEAK_JWT_SECRETS.includes(process.env.JWT_SECRET)) {
    throw new Error(
      "JWT_SECRET is not set or is using the placeholder value from .env.example.",
    );
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
