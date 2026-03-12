import * as z from "zod/v4";

export const signInSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

export type SignInInput = z.input<typeof signInSchema>;
export type SignInOutput = z.output<typeof signInSchema>;
