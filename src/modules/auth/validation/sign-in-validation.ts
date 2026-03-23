import * as z from "zod";

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

export type SignInType = z.infer<typeof SignInSchema>;
