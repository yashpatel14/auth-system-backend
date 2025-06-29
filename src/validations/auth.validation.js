import {z} from "zod";

// Password validation schema
const strongPassword = z
  .string()
  .min(6, { message: "Password must be at least 6 characters long" })
  .max(16, { message: "Password must be at most 16 characters long" })
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, number and one special character.",
  });

// Register schema
const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: strongPassword,
  fullname: z
    .string()
    .min(2, { message: "Fullname must be at least 2 characters long" })
    .max(50, { message: "Fullname must be at most 50 characters long" }),
});

// Login schema
const loginSchema = registerSchema
  .pick({
    email: true,
    password: true,
  })
  .extend({
    rememberMe: z.boolean().default(false),
  });

// Email-only schema
const emailSchema = registerSchema.pick({
  email: true,
});

// Change password schema
const changePasswordSchema = z
  .object({
    currentPassword: strongPassword,
    newPassword: strongPassword,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Confirm password must match the new password",
    path: ["confirmNewPassword"],
  });

// Reset password schema
const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password must match the new password",
    path: ["confirmPassword"],
  });

// Validation functions
const validateRegister = (data) => {
  return registerSchema.safeParse(data);
};

const validateLogin = (data) => {
  return loginSchema.safeParse(data);
};

const validateEmail = (data) => {
  return emailSchema.safeParse(data);
};

const validateChangePassword = (data) => {
  return changePasswordSchema.safeParse(data);
};

const validateResetPassword = (data) => {
  return resetPasswordSchema.safeParse(data);
};

export{
  validateRegister,
  validateLogin,
  validateEmail,
  validateChangePassword,
  validateResetPassword,
};
