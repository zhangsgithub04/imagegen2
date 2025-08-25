import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token');
    
    if (!token?.value) {
      return NextResponse.json(
        { success: false, error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify token
    const tokenData = verifyToken(token.value);
    
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Return user data from token
    return NextResponse.json({
      success: true,
      user: {
        id: tokenData.userId,
        email: tokenData.email,
        username: tokenData.username,
        createdAt: '', // We don't store this in the token
      },
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Token verification failed' },
      { status: 500 }
    );
  }
}
