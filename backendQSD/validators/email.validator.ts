import { z } from "zod";

export const sendEmailSchema = z.object({
  to: z.email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  scheduled_at:  z.coerce.date(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
