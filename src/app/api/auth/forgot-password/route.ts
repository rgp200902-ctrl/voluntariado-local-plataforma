import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email é obrigatório');
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(null, 'Se o email existir, receberá instruções de recuperação');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // In a real app, you would save the token to the database
    // and send an email with the reset link
    console.log(`Reset token for ${email}: ${resetToken}`);

    // TODO: Send email with reset link
    // await sendResetEmail(email, resetToken);

    return successResponse(null, 'Se o email existir, receberá instruções de recuperação');
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('Erro ao processar pedido', 500);
  }
}
