import { z } from "zod";

/* REGISTER */

export const registerSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    captchaInput: z.string().min(1, "Captcha required"),
    captchaGenerated: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.captchaInput === data.captchaGenerated, {
    message: "Captcha incorrect",
    path: ["captchaInput"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;


/* LOGIN */

export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    captchaInput: z.string().min(1, "Captcha required"),
    captchaGenerated: z.string(),
  })
  .refine((data) => data.captchaInput === data.captchaGenerated, {
    message: "Captcha incorrect",
    path: ["captchaInput"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;