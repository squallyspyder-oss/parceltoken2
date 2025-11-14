import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { handlePixWebhook, handlePixExpired, handlePixFailed } from "./webhookHandler";

export const webhookRouter = router({
  pixNotification: publicProcedure
    .input(z.object({
      txid: z.string(),
      status: z.string(),
      paidAt: z.string().optional(),
      amount: z.number(),
      payer: z.object({
        cpf: z.string(),
        name: z.string()
      }).optional()
    }))
    .mutation(async ({ input }) => {
      try {
        if (input.status === 'CONCLUIDA') {
          await handlePixWebhook(input);
        } else if (input.status === 'REMOVIDA_PELO_PSP') {
          await handlePixExpired(input);
        } else if (input.status === 'FALHA') {
          await handlePixFailed(input);
        }
        return { success: true };
      } catch (error) {
        console.error('[Webhook] Erro:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Webhook processing failed'
        });
      }
    })
});
