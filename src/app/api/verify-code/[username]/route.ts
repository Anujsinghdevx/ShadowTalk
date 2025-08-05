import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  await dbConnect();

  try {
    const { code } = await request.json();

    // ✅ Only check for code, not params.username
    if (!code) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing verification code' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const decodedUsername = decodeURIComponent(params.username);
    const user = await UserModel.findOne({ username: decodedUsername });

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
          message:
            'Verification code has expired. Please sign up again to get a new code.',
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
