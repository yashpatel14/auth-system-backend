import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/auth.model.js";
import mongoose from "mongoose";
import { transformSessions } from "../utils/transfromSessions.js";

const getAllUsers = asyncHandler(async (req, res) => {
  const adminId = req.user.id;

  const users = await User.aggregate([
    {
      $match: {
        isVerified: true,
        _id: { $ne: new mongoose.Types.ObjectId(adminId) },
      },
    },
    {
      $lookup: {
        from: "sessions",
        localField: "_id",
        foreignField: "userId",
        as: "sessions",
      },
    },
    {
      $addFields: {
        latestSession: {
          $arrayElemAt: [{ $slice: [{ $reverseArray: "$sessions" }, 1] }, 0],
        },
        sessionsCount: { $size: "$sessions" },
      },
    },
    {
      $project: {
        id: "$_id",
        fullname: 1,
        email: 1,
        avatar: 1,
        role: 1,
        createdAt: 1,
        latestSession: {
          updatedAt: 1,
          expiresAt: 1,
        },
        sessionsCount: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  const formattedUsers = users.map((user) => {
    const session = user.latestSession;
    return {
      id: user.id,
      fullname: capitalize(user.fullname),
      email: user.email,
      role: user.role,
      status: session
        ? new Date() < new Date(session.expiresAt)
          ? "active"
          : "expired"
        : "inactive",
      lastActive: session
        ? format(new Date(session.updatedAt), "d/M/yyyy, h:mm:ss a")
        : "",
      sessionsCount: user.sessionsCount,
    };
  });

  logger.info("Admin fetched all users");

  return res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully", formattedUsers));
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const sessions = await Session.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        id: "$_id",
        ipAddress: 1,
        userAgent: 1,
        updatedAt: 1,
        expiresAt: 1,
        createdAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  if (!sessions.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No sessions are active"));
  }

  const formattedSession = await transformSessions(sessions); // custom function you already have

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formattedSession,
        "User sessions fetched successfully"
      )
    );
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const allowedRoles = Object.values(UserRole);
  if (!role || !allowedRoles.includes(role)) {
    throw new CustomError(400, "Invalid or missing role");
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { role },
    { new: true } // return the updated document
  );

  if (!updatedUser) {
    throw new CustomError(404, "User not found");
  }

  const safeUser = {
    id: updatedUser._id,
    fullname: updatedUser.fullname,
    email: updatedUser.email,
    role: updatedUser.role,
  };

  logger.info(`Role of ${userId} is updated successfully to ${role}`, {
    updatedBy: req.user.email,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "User role updated successfully"));
});

const deleteUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await User.deleteOne({ _id: userId });

  logger.info(`Admin deleted user with ID ${userId}`);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully"));
});

const logoutUserSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }

  const deleted = await Session.deleteOne({ _id: sessionId });

  if (deleted.deletedCount === 0) {
    throw new ApiError(404, "Session not found");
  }

  logger.info(`Session ${sessionId} deleted`, { deletedBy: req.user.email });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Session deleted successfully"));
});

export { getAllUsers, getUserById, updateUserRole, deleteUserById, logoutUserSession };
