import { z } from "zod";

export const ambulanceRequestSchema = z.object({
  name: z.string().trim().max(100).optional().default(""),
  phone: z.string().trim().max(30).optional().default(""),
  email: z.string().trim().toLowerCase().email().optional(),
  location: z
    .object({
      lat: z.number().finite().optional(),
      lng: z.number().finite().optional(),
      accuracy: z.number().finite().optional(),
      note: z.string().trim().max(300).optional().default(""),
    })
    .optional(),
});
