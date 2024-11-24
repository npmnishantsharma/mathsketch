import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

// Handle GET requests
export async function GET(
  request: NextRequest,
  context: { params: { device: string } }
) {
  const device = await request.nextUrl.searchParams.get('device');

  try {
    // Only allow desktop-win authentication
    if (device !== 'desktop-win') {
      return NextResponse.json(
        { error: 'Invalid device type' },
        { status: 400 }
      );
    }

    // Get user data from the page component
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');
    if (!uid) {
      return NextResponse.json(
        { error: 'No user ID provided' },
        { status: 401 }
      );
    }

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', uid));
    const userData = userDoc.data();
    //check if user exists
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      status: 'success',
      data: {
        user: {
          uid: uid,
          points: userData?.points || 0,
          displayName: userData?.displayName,
          email: userData?.email,
          photoURL: userData?.photoURL,
        },
        isDesktopAllowed: true
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle POST requests
export async function POST(
  request: NextRequest,
  context: { params: { device: string } }
) {
  const device = await context.params.device;

  try {
    // Only allow desktop-win authentication
    if (device !== 'desktop-win') {
      return NextResponse.json(
        { error: 'Invalid device type' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { uid } = body;

    if (!uid) {
      return NextResponse.json(
        { error: 'No user ID provided' },
        { status: 400 }
      );
    }

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', uid));
    const userData = userDoc.data();

    return NextResponse.json({
      status: 'success',
      data: {
        user: {
          uid: uid,
          points: userData?.points || 0,
          displayName: userData?.displayName,
          email: userData?.email,
          photoURL: userData?.photoURL,
        },
        isDesktopAllowed: true
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(
  request: NextRequest,
  context: { params: { device: string } }
) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 