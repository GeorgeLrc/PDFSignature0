import { z } from "zod";
import { validatePasswordStrength } from "./passwordRules";

export const LogInFormFieldsSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(1, { message: "Password is required." })
    .refine(
      (password) => validatePasswordStrength(password).isValid,
      (password) => {
        const validation = validatePasswordStrength(password);
        return {
          message: validation.errors[0] || "Password does not meet security requirements",
        };
      }
    ),
});

export const createUserFormFieldSchema = z
  .object({
    first_name: z.string().min(1, { message: "First name is required." }),
    last_name: z.string().min(1, { message: "Last name is required." }),
    email: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Invalid email format" }),
    password: z
      .string()
      .min(1, { message: "Password is required." })
      .refine(
        (password) => validatePasswordStrength(password).isValid,
        (password) => {
          const validation = validatePasswordStrength(password);
          return {
            message: validation.errors[0] || "Password does not meet security requirements",
          };
        }
      ),
    image: z.any().optional(),
    editImage: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    const isEdit = !!data.editImage || !data.image;
    if (!isEdit) {
      if (!data.image || data.image.length !== 1) {
        ctx.addIssue({
          path: ["image"],
          code: z.ZodIssueCode.custom,
          message: "Please upload an image",
        });
      } else if (!data.image[0]?.type?.startsWith("image/")) {
        ctx.addIssue({
          path: ["image"],
          code: z.ZodIssueCode.custom,
          message: "Only image files are allowed",
        });
      }
    }
  });

export const uploadTemplateFormFieldSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
});
