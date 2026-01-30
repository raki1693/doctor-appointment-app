import { z } from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.string().min(1),
  notes: z.string().optional(),
});
