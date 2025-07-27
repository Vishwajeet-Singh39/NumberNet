import { z } from 'zod';

export const numberSchema = z.object({
  number: z.string()
    .length(4, { message: "Number must be 4 digits long." })
    .regex(/^\d{4}$/, { message: "Only digits are allowed." }),
});

export type NumberSchema = z.infer<typeof numberSchema>;
