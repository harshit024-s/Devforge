const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string({
      error: (issue) => (issue.input === undefined ? "Name is required" : "Name must be a string"),
    })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),

  email: z
    .string({
      error: (issue) => (issue.input === undefined ? "Email is required" : "Email must be a string"),
    })
    .trim()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),

  inviteCode: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
    .refine((val) => !val || val.length === 6, {
      message: "Invite code must be exactly 6 characters",
    }),
});

module.exports = { registerSchema };
