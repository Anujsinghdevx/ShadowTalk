import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const userData = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: { path: "$messages", preserveNullAndEmptyArrays: true } }, // Preserve empty messages
      { $sort: { "messages.createdAt": -1 } },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
        },
      },
    ]).exec();

    // If user exists but has no messages, return an empty array instead of an error
    if (!userData || userData.length === 0) {
      return Response.json(
        {
          success: true,
          message: "No messages found",
          messages: [],
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User messages fetched successfully",
        messages: userData[0].messages // Remove null messages
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return Response.json(
      {
        success: false,
        message: "Something went wrong, please try again later",
      },
      { status: 500 }
    );
  }
}
