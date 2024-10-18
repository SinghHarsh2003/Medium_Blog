import { z, ZodAny } from "zod";

export const signupInput = z.object({
    username: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional()
})

//type inference in zod
export type signupInput = z.infer<typeof signupInput>

export const signinInput = z.object({
    username: z.string().email(),
    password: z.string().min(6),
})

//type inference in zod
export type signinInput = z.infer<typeof signupInput>


export const createBlogInput = z.object({
    title: z.string(),
    content: z.string(),
})

export type createBlogInput = z.infer<typeof createBlogInput>


export const updatePostInput = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
});

export type UpdatePostType = z.infer<typeof updatePostInput>;