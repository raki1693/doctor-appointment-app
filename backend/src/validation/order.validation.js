import { z } from "zod";

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      qty: z.number().int().min(1),
    })
  ).min(1),
  shippingAddress: z.string().min(5),
});
