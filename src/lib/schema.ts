
import { z } from 'zod';

// This schema is not used in the online version anymore but kept for potential future use.
export const createNumberSchema = (length: number) => z.object({
  number: z.string()
    .length(length, { message: `Number must be ${length} digits long.` })
    .regex(new RegExp(`^\\d{${length}}$`), { message: "Only digits are allowed." }),
});

export type NumberSchema = z.infer<returnType<typeof createNumberSchema>>;
