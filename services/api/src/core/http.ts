import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
export function parse<T extends z.ZodTypeAny>(schema: T, value: unknown): z.output<T> {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new BadRequestException({
      message: 'Check the highlighted fields',
      fields: result.error.flatten().fieldErrors,
    });
  return result.data;
}
@Catch()
export class Errors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    let status = 500;
    let message = 'Unable to complete this request';
    let fields: unknown;
    if (error instanceof HttpException) {
      status = error.getStatus();
      const detail = error.getResponse();
      message = typeof detail === 'string' ? detail : (detail as { message: string }).message;
      fields = typeof detail === 'object' ? (detail as { fields?: unknown }).fields : undefined;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        status = 409;
        message = 'This record or reservation already exists';
      }
      if (error.code === 'P2025') {
        status = 404;
        message = 'Record not found';
      }
    }
    const requestId = randomUUID();
    if (status === 500)
      console.error(
        JSON.stringify({
          level: 'error',
          requestId,
          type: error instanceof Error ? error.name : 'UnknownError',
        }),
      );
    response.status(status).json({ error: { code: status, message, requestId, fields } });
  }
}
