import mongoose, { Schema } from "mongoose";
import { AvailableSocialLogins, AvailableUserRoles, UserLoginType, UserRolesEnum } from "../constants.js";

const sessionSchema = new Schema(
  {
    userId:{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,   
    },
    refreshToken: {
      type: String,
      required: true,
      unique:true
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
    userAgent: {
      type: String,
      
    },
    ipAddress: {
      type: String,
      
    },
    expiresAt: {
      type: Date,
      
    },
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model("Session", sessionSchema);
