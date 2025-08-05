import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(request: NextRequest, context: any) {
  await dbConnect();

  try {
    const { code } = await request.json();

    const username = decodeURIComponent(context.params.username);

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing verification code' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return new Response(
        JSON.stringify({ success: true, message: 'Account verified successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else if (!isCodeNotExpired) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Verification code has expired. Please sign up again to get a new code.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Incorrect verification code' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error verifying user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
