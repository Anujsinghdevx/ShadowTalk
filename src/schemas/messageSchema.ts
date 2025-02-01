import {z} from 'zod'

export const messageSchema = z.object({
    content: z
    .string()
    .min(10,"content must be of 10 char")
    .max(300,"not allowed")
})