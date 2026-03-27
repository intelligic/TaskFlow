import { z } from "zod";

const normalizeCaptcha = (value: string) => value.trim().toUpperCase();

const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{10}$/;

/* REGISTER */

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .regex(nameRegex, "Name can contain only letters and spaces"),
    email: z.string().email("Invalid email address"),
    workspaceName: z
      .string()
      .trim()
      .min(2, "Workspace name must be at least 2 characters")
      .regex(nameRegex, "Workspace name can contain only letters and spaces")
      .optional(),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must be exactly 10 characters with uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string(),
    captchaInput: z.string().min(1, "Captcha required"),
    captchaGenerated: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => normalizeCaptcha(data.captchaInput) === normalizeCaptcha(data.captchaGenerated), {
    message: "Captcha incorrect",
    path: ["captchaInput"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;


/* LOGIN */

export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must be exactly 10 characters with uppercase, lowercase, number, and special character",
      ),
    captchaInput: z.string().min(1, "Captcha required"),
    captchaGenerated: z.string(),
  })
  .refine((data) => normalizeCaptcha(data.captchaInput) === normalizeCaptcha(data.captchaGenerated), {
    message: "Captcha incorrect",
    path: ["captchaInput"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;

/* FORGOT PASSWORD (DIRECT RESET) */

export const forgotPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must be exactly 10 characters with uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
