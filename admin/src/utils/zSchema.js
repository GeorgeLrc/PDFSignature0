import { z } from "zod";

export const LogInFormFieldsSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required." })
        .email({ message: "Invalid email format" }),
    password: z.string()
        .min(1, { message: 'Password is required.' })
        .min(6, { message: 'Password must be at least 6 characters long.' })
})

export const createUserFormFieldSchema = z.object({
    first_name: z.string()
        .min(1, { message: "First name is required." }),
    last_name: z.string()
        .min(1, { message: "Last name is required." }),
    email: z.string()
        .min(1, { message: "Email is required." })
        .email({ message: "Invalid email format" }),
    password: z.string()
        .optional()
        .refine(
            (val) => !val || val.length >= 6,
            { message: 'Password must be at least 6 characters long.' }
        ),
    image: z.any().optional(),
    editImage: z.any().optional()
}).superRefine((data, ctx) => {
    const isEdit = !!data.editImage || !data.image;
    
    // For create: password is required
    if (!isEdit) {
        if (!data.password) {
            ctx.addIssue({
                path: ['password'],
                code: z.ZodIssueCode.custom,
                message: 'Password is required.'
            });
        }
        if (!data.image || data.image.length !== 1) {
            ctx.addIssue({
                path: ['image'],
                code: z.ZodIssueCode.custom,
                message: 'Please upload an image'
            });
        } else if (!data.image[0]?.type?.startsWith('image/')) {
            ctx.addIssue({
                path: ['image'],
                code: z.ZodIssueCode.custom,
                message: 'Only image files are allowed'
            });
        }
    }
});

export const uploadTemplateFormFieldSchema = z.object({
    title: z.string()
        .min(1, { message: "Title is required." }),
})