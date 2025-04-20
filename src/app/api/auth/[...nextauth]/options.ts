import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';  // Make sure to have a dbConnect function
import UserModel from '@/model/User';  // Import your User model

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      //@ts-expect-error : Ignoring type error here 
      async authorize(credentials) {
        // Ensuring dbConnect is called to connect to MongoDB
        await dbConnect();

        if (!credentials || !credentials.identifier || !credentials.password) {
          throw new Error('Missing credentials');
        }

        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error('No user found with this email/username');
          }

          // Check if the user is verified
          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }

          // Compare password
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            // If password matches, return user object
            return {
              _id: user.id.toString(),
              username: user.username,
              email: user.email,
              isVerified: user.isVerified,
              isAcceptingMessages: user.isAcceptingMessages,
            };
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err) {
          if (err instanceof Error) {
            throw new Error(err.message || 'An error occurred during authentication');
          } else {
            // Fallback in case the error doesn't have the expected shape
            throw new Error('An unknown error occurred during authentication');
        }
      }
      },
    }),
  ],

  callbacks: {
    // JWT callback to store additional user data
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.username = user.username;
        token.email = user.email;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
      }
      return token;
    },

    // Session callback to provide user info in the session
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt', // Use JWT strategy for stateless authentication
  },

  secret: process.env.NEXTAUTH_SECRET, // Secret for JWT signing (you can generate one)
  pages: {
    signIn: '/sign-in', // Custom sign-in page
  },
};
