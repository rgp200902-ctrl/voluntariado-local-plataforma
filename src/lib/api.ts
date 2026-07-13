import { NextResponse } from 'next/server';
import { getUserFromRequest, type TokenPayload } from './auth';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, message?: string, status = 200): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return NextResponse.json(response, { status });
}

export function errorResponse(error: string, status = 400): NextResponse {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return NextResponse.json(response, { status });
}

export function unauthorizedResponse(message = 'Não autorizado'): NextResponse {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Acesso negado'): NextResponse {
  return errorResponse(message, 403);
}

export function notFoundResponse(message = 'Recurso não encontrado'): NextResponse {
  return errorResponse(message, 404);
}

export function getAuthenticatedUser(request: Request): TokenPayload | null {
  return getUserFromRequest(request);
}

export function requireAuth(request: Request): TokenPayload {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export function requireRole(request: Request, role: string): TokenPayload {
  const user = requireAuth(request);
  if (user.role !== role) {
    throw new Error('FORBIDDEN');
  }
  return user;
}
