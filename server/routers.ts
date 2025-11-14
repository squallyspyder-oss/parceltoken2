import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { createHash } from "crypto";
import { generateQRCodePNG, generateQRCodeSVG, generateSmartQRPayload } from "./services/qrGenerator";
import { handlePixWebhook, handlePixExpired, handlePixFailed, validateWebhookSignature } from "./webhookHandler";
import { webhookRouter } from "./webhookRouter";

// Helper para gerar hash de token
function generateTokenHash(userId: number, timestamp: number): string {
  return createHash('sha256')
    .update(`${userId}-${timestamp}-${Math.random()}`)
    .digest('hex');
}

// Helper para calcular economia vs cartão tradicional (MDR 3.5% vs 1%)
function calculateSavings(amount: number): number {
  const cardMDR = 0.035; // 3.5%
  const ourMDR = 0.01; // 1%
  return Math.floor(amount * (cardMDR - ourMDR));
}

export const appRouter = router({
  system: systemRouter,
  webhook: webhookRouter,
  
  pix: router({
    generateCharge: protectedProcedure
      .input(z.object({
        installmentId: z.number(),
        amount: z.number(),
        description: z.string(),
        payerName: z.string().optional(),
        payerCpf: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        const { generatePixForInstallment } = await import('./pixService');
        const charge = await generatePixForInstallment(
          input.installmentId,
          input.amount,
          input.description,
          input.payerName,
          input.payerCpf
        );
        return charge;
      }),

    checkStatus: protectedProcedure
      .input(z.object({ chargeId: z.string() }))
      .query(async ({ input }) => {
        const { checkPixChargeStatus } = await import('./pixService');
        const status = await checkPixChargeStatus(input.chargeId);
        return status;
      }),
  }),

  reminders: router({
    sendManual: protectedProcedure.mutation(async () => {
      const { runManualReminders } = await import('./reminderService');
      const result = await runManualReminders();
      return result;
    }),
  }),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= USER / CONSUMER ROUTES =============
  user: router({
    // Get user profile with stats
    profile: protectedProcedure.query(async ({ ctx }) => {
      const stats = await db.getUserStats(ctx.user.id);
      return {
        ...ctx.user,
        stats
      };
    }),

    // Get user's active ParcelToken
    getActiveToken: protectedProcedure.query(async ({ ctx }) => {
      const token = await db.getActiveParcelTokenByUserId(ctx.user.id);
      return token;
    }),

    // Request new ParcelToken (simulated underwriting)
    requestToken: protectedProcedure
      .input(z.object({
        requestedLimit: z.number().min(50000).max(500000), // R$ 500 a R$ 5.000 em centavos
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already has an active token
        const existingToken = await db.getActiveParcelTokenByUserId(ctx.user.id);
        if (existingToken) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Você já possui um ParcelToken ativo'
          });
        }

        // Simulated underwriting (in production, would integrate with Open Banking, credit score, etc)
        const approvedLimit = Math.min(input.requestedLimit, 200000); // Max R$ 2.000 for demo
        
        // Generate token
        const tokenHash = generateTokenHash(ctx.user.id, Date.now());
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 6); // 6 months validity

        const tokenId = await db.createParcelToken({
          userId: ctx.user.id,
          tokenHash,
          creditLimit: approvedLimit,
          maxInstallments: 4,
          interestRate: 0, // 0% for demo
          status: 'active',
          usedAmount: 0,
          expiresAt
        });

        // Update user credit info
        await db.updateUserCredit(ctx.user.id, approvedLimit, approvedLimit);

        // Notificar usuário
        if (tokenId) {
          const { notifyTokenApproved } = await import('./notificationHelper');
          await notifyTokenApproved(ctx.user.id, tokenId, approvedLimit);
        }

        return {
          tokenId,
          tokenHash,
          creditLimit: approvedLimit,
          maxInstallments: 4,
          expiresAt
        };
      }),

    // Get transaction history
    transactions: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50)
      }))
      .query(async ({ ctx, input }) => {
        const transactions = await db.getTransactionsByUser(ctx.user.id, input.limit);
        return transactions;
      }),

    // Get installment plans
    installmentPlans: protectedProcedure.query(async ({ ctx }) => {
      const plans = await db.getInstallmentPlansByUser(ctx.user.id);
      return plans;
    }),

    // Get user badges
    badges: protectedProcedure.query(async ({ ctx }) => {
      const badges = await db.getUserBadges(ctx.user.id);
      return badges;
    }),

    // Simulate payment calculation
    simulatePayment: protectedProcedure
      .input(z.object({
        amount: z.number().min(1000), // Min R$ 10
        installments: z.number().min(1).max(12)
      }))
      .query(({ input }) => {
        const { amount, installments } = input;
        const installmentAmount = Math.ceil(amount / installments);
        const savings = calculateSavings(amount);
        
        return {
          amount,
          installments,
          installmentAmount,
          totalAmount: installmentAmount * installments,
          savings,
          savingsPercentage: (savings / amount) * 100
        };
      }),

    // **NEW** Reuse existing ParcelToken for a new purchase
    reuseToken: protectedProcedure
      .input(z.object({
        tokenId: z.number(),
        merchantId: z.number(),
        amount: z.number().min(1000), // Min R$ 10
        installments: z.number().min(1).max(12)
      }))
      .mutation(async ({ ctx, input }) => {
        // Get token
        const token = await db.getParcelTokenById(input.tokenId);
        if (!token) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Token não encontrado'
          });
        }

        // Verify ownership
        if (token.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Este token não pertence a você'
          });
        }

        // Check if token is active
        if (token.status !== 'active') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Token não está ativo'
          });
        }

        // Check if token is expired
        if (new Date(token.expiresAt) < new Date()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Token expirado'
          });
        }

        // Check available limit
        const availableLimit = token.creditLimit - (token.usedAmount || 0);
        if (input.amount > availableLimit) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Limite insuficiente. Disponível: R$ ${(availableLimit / 100).toFixed(2)}`
          });
        }

        // Check installments
        if (input.installments > (token.maxInstallments || 1)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Máximo de ${token.maxInstallments || 1}x parcelas`
          });
        }

        // Create transaction (reusing token)
        const installmentAmount = Math.ceil(input.amount / input.installments);
        const feeAmount = Math.floor(input.amount * 0.01); // 1% fee
        const netAmount = input.amount - feeAmount;
        const savingsAmount = calculateSavings(input.amount);
        
        const transactionId = await db.createTransaction({
          userId: ctx.user.id,
          merchantId: input.merchantId,
          parcelTokenId: input.tokenId,
          smartQRId: null,
          amount: input.amount,
          feeAmount,
          netAmount,
          savingsAmount,
          installments: input.installments,
          installmentAmount,
          paymentMethod: 'parceltoken',
          paymentRail: 'PIX',
          status: 'completed',
          settledAt: new Date(),
          settlementMethod: 'instant_pix',
          description: `Reutilização de ParcelToken #${input.tokenId}`,
          metadata: null
        });

        // Update token used amount
        const newUsedAmount = (token.usedAmount || 0) + input.amount;
        await db.updateParcelTokenUsedAmount(input.tokenId, newUsedAmount);

        return {
          transactionId,
          message: 'Token reutilizado com sucesso!',
          newAvailableLimit: token.creditLimit - newUsedAmount
        };
      }),

    // **NEW** Get token usage history
    tokenHistory: protectedProcedure
      .input(z.object({
        tokenId: z.number().optional()
      }))
      .query(async ({ ctx, input }) => {
        const history = await db.getTokenUsageHistory(ctx.user.id, input.tokenId);
        return history;
      }),

    // **NEW** Get active installment plans with payments
    activeInstallmentPlans: protectedProcedure.query(async ({ ctx}) => {
      const plans = await db.getActiveInstallmentPlans(ctx.user.id);
      
      // Get payments for each plan
      const plansWithPayments = await Promise.all(
        plans.map(async (plan) => {
          const payments = await db.getInstallmentsByPlanId(plan.id);
          return {
            ...plan,
            payments
          };
        })
      );
      
      return plansWithPayments;
    }),

    // **NEW** Get all installment plans (active + completed)
    allInstallmentPlans: protectedProcedure.query(async ({ ctx }) => {
      const plans = await db.getInstallmentPlansByUser(ctx.user.id);
      return plans;
    }),

    // **NEW** Mark installment as paid
    payInstallment: protectedProcedure
      .input(z.object({
        paymentId: z.number(),
        planId: z.number()
      }))
      .mutation(async ({ ctx, input }) => {
        // Update payment status
        await db.updateInstallmentPaymentStatus(input.paymentId, 'paid', new Date());
        
        // Get all payments for this plan to count paid ones
        const payments = await db.getInstallmentsByPlanId(input.planId);
        const paidCount = payments.filter((p: any) => p.status === 'paid').length;
        
        // Update plan progress
        await db.updateInstallmentPlanProgress(input.planId, paidCount);
        
        return {
          success: true,
          paidCount,
          totalInstallments: payments.length
        };
      }),

    // **NEW** Get upcoming installments (due soon)
    rescheduleInstallments: protectedProcedure
      .input(z.object({
        planId: z.number(),
        newDueDates: z.array(z.date())
      }))
      .mutation(async ({ input }) => {
        const { rescheduleInstallments } = await import('./installmentEngine');
        await rescheduleInstallments(input.planId, input.newDueDates);
        return { success: true, message: 'Parcelas renegociadas com sucesso' };
      }),

    upcomingInstallments: protectedProcedure.query(async ({ ctx }) => {
      const upcoming = await db.getUpcomingInstallments(ctx.user.id, 3);
      return upcoming;
    }),

    // **NEW** Process SmartQR with adaptive logic (detect active token)
    processSmartQR: protectedProcedure
      .input(z.object({
        qrId: z.string(),
        amount: z.number(),
        merchantId: z.number(),
        installments: z.number()
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user has active token
        const activeToken = await db.getActiveParcelTokenByUserId(ctx.user.id);
        
        if (activeToken) {
          const availableCredit = activeToken.creditLimit - (activeToken.usedAmount || 0);
          
          return {
            hasActiveToken: true,
            tokenId: activeToken.id,
            availableCredit,
            canUseToken: availableCredit >= input.amount,
            tokenDetails: {
              limit: activeToken.creditLimit,
              used: activeToken.usedAmount || 0,
              available: availableCredit
            }
          };
        }
        
        return {
          hasActiveToken: false,
          canUseToken: false
        };
      }),
  }),

  // ============= MERCHANT ROUTES =============
  merchant: router({
    // Register as merchant
    register: protectedProcedure
      .input(z.object({
        businessName: z.string().min(3),
        tradeName: z.string().optional(),
        document: z.string().optional(),
        feePercentage: z.number().optional().default(50) // basis points
      }))
      .mutation(async ({ ctx, input }) => {
        const merchant = await db.createMerchant({
          userId: ctx.user.id,
          businessName: input.businessName,
          tradeName: input.tradeName || null,
          document: input.document || null,
          feePercentage: input.feePercentage,
          active: true,
          category: null,
          instantSettlement: true,
          totalTransactions: 0,
          totalVolume: 0,
          webhookUrl: null,
          webhookSecret: null
        });

        return merchant;
      }),

    // Get merchant profile
    profile: protectedProcedure.query(async ({ ctx }) => {
      const merchant = await db.getMerchantByUserId(ctx.user.id);
      if (!merchant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Merchant não encontrado'
        });
      }

      const stats = await db.getMerchantStats(merchant.id);
      return {
        ...merchant,
        stats
      };
    }),

    // Generate SmartQR
    generateQR: protectedProcedure
      .input(z.object({
        amount: z.number().min(100), // Min R$ 1
        description: z.string().optional(),
        maxInstallments: z.number().min(1).max(12).optional().default(4),
        cashbackPercentage: z.number().min(0).max(1000).optional().default(0), // basis points
        discountPercentage: z.number().min(0).max(1000).optional().default(0)
      }))
      .mutation(async ({ ctx, input }) => {
        const merchant = await db.getMerchantByUserId(ctx.user.id);
        if (!merchant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Merchant não encontrado'
          });
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24h validity

        const qrData = {
          version: '1.0',
          merchantId: merchant.id,
          amount: input.amount,
          description: input.description || '',
          maxInstallments: input.maxInstallments,
          cashbackPercentage: input.cashbackPercentage,
          discountPercentage: input.discountPercentage,
          expiresAt: expiresAt.toISOString()
        };

        const qrId = await db.createSmartQR({
          merchantId: merchant.id,
          qrCode: JSON.stringify(qrData),
          amount: input.amount,
          description: input.description || null,
          maxInstallments: input.maxInstallments,
          allowedPaymentMethods: JSON.stringify(['parceltoken', 'pix', 'card']),
          cashbackPercentage: input.cashbackPercentage,
          discountPercentage: input.discountPercentage,
          status: 'pending',
          sessionId: generateTokenHash(merchant.id, Date.now()),
          expiresAt
        });

        return {
          qrId,
          qrData,
          qrCode: JSON.stringify(qrData) // In production, would generate actual QR code image
        };
      }),

    // Get merchant transactions
    transactions: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50)
      }))
      .query(async ({ ctx, input }) => {
        const merchant = await db.getMerchantByUserId(ctx.user.id);
        if (!merchant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Merchant não encontrado'
          });
        }

        const transactions = await db.getTransactionsByMerchant(merchant.id, input.limit);
        return transactions;
      }),

    // Get QR Code by ID (public)
    getQRById: publicProcedure
      .input(z.object({ qrId: z.number() }))
      .query(async ({ input }) => {
        if (input.qrId <= 0) {
          return {
            id: 999,
            amount: 15000,
            description: "Compra Demo - Produto Exemplo",
            maxInstallments: 4,
            merchantName: "Loja Demo"
          };
        }
        const qr = await db.getSmartQRById(input.qrId);
        if (!qr) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'QR Code nao encontrado' });
        }
        return {
          id: qr.id,
          amount: qr.amount,
          description: qr.description || '',
          maxInstallments: qr.maxInstallments || 4,
          merchantName: 'Merchant'
        };
      }),

    // Get merchant QR codes
    qrCodes: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50)
      }))
      .query(async ({ ctx, input }) => {
        const merchant = await db.getMerchantByUserId(ctx.user.id);
        if (!merchant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Merchant não encontrado'
          });
        }

        const qrCodes = await db.getSmartQRsByMerchant(merchant.id, input.limit);
        return qrCodes;
      }),
    // Get merchant analytics
    analytics: protectedProcedure
      .input(z.object({
        period: z.enum(['7days', '30days', '90days']).optional().default('30days')
      }))
      .query(async ({ ctx, input }) => {
        const merchant = await db.getMerchantByUserId(ctx.user.id);
        if (!merchant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Merchant nao encontrado'
          });
        }

        const transactions = await db.getTransactionsByMerchant(merchant.id, 1000);
        
        // Calculate analytics
        const totalTransactions = transactions.length;
        const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const parcelTokenTransactions = transactions.filter(t => t.paymentMethod === 'parceltoken').length;
        const parcelTokenVolume = transactions
          .filter(t => t.paymentMethod === 'parceltoken')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const averageTicket = totalTransactions > 0 ? Math.floor(totalVolume / totalTransactions) : 0;
        const conversionRate = totalTransactions > 0 ? ((parcelTokenTransactions / totalTransactions) * 100).toFixed(2) : '0';
        
        // Calculate ROI (assuming 0.5% fee per transaction with ParcelToken)
        const roi = Math.floor(parcelTokenVolume * 0.005);
        
        // Monthly data for chart
        const monthlyData = [
          { month: 'Jan', volume: Math.floor(totalVolume * 0.12), transactions: Math.floor(totalTransactions * 0.12), roi: Math.floor(roi * 0.12) },
          { month: 'Fev', volume: Math.floor(totalVolume * 0.14), transactions: Math.floor(totalTransactions * 0.14), roi: Math.floor(roi * 0.14) },
          { month: 'Mar', volume: Math.floor(totalVolume * 0.16), transactions: Math.floor(totalTransactions * 0.16), roi: Math.floor(roi * 0.16) },
          { month: 'Abr', volume: Math.floor(totalVolume * 0.18), transactions: Math.floor(totalTransactions * 0.18), roi: Math.floor(roi * 0.18) },
          { month: 'Mai', volume: Math.floor(totalVolume * 0.20), transactions: Math.floor(totalTransactions * 0.20), roi: Math.floor(roi * 0.20) },
          { month: 'Jun', volume: totalVolume, transactions: totalTransactions, roi: roi }
        ];

        return {
          merchant: {
            id: merchant.id,
            businessName: merchant.businessName
          },
          summary: {
            totalTransactions,
            totalVolume,
            averageTicket,
            parcelTokenTransactions,
            parcelTokenVolume,
            conversionRate: parseFloat(conversionRate),
            roi
          },
          monthlyData,
          comparison: {
            beforeParcelToken: Math.floor(totalVolume * 0.7),
            afterParcelToken: totalVolume,
            growth: Math.floor((totalVolume - (totalVolume * 0.7)) / (totalVolume * 0.7) * 100)
          }
        };
      }),

    // Webhooks configuration
    webhooks: router({
      getConfig: protectedProcedure.query(async ({ ctx }) => {
        const merchant = await db.getMerchantByUserId(ctx.user.id);
        if (!merchant) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Merchant não encontrado' });
        }
        return {
          webhookUrl: merchant.webhookUrl || null,
          webhookSecret: merchant.webhookSecret || null,
        };
      }),

      saveConfig: protectedProcedure
        .input(z.object({ webhookUrl: z.string().url() }))
        .mutation(async ({ ctx, input }) => {
          const merchant = await db.getMerchantByUserId(ctx.user.id);
          if (!merchant) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Merchant não encontrado' });
          }

          // Generate secret if not exists
          let secret = merchant.webhookSecret;
          if (!secret) {
            secret = createHash('sha256').update(`${merchant.id}-${Date.now()}`).digest('hex');
          }

          await db.updateMerchantWebhook(merchant.id, input.webhookUrl, secret);
          return { success: true };
        }),

      regenerateSecret: protectedProcedure.mutation(async ({ ctx }) => {
        const merchant = await db.getMerchantByUserId(ctx.user.id);
        if (!merchant) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Merchant não encontrado' });
        }

        const newSecret = createHash('sha256').update(`${merchant.id}-${Date.now()}`).digest('hex');
        await db.updateMerchantWebhook(merchant.id, merchant.webhookUrl || '', newSecret);
        return { success: true };
      }),

      sendTest: protectedProcedure.mutation(async ({ ctx }) => {
        const merchant = await db.getMerchantByUserId(ctx.user.id);
        if (!merchant || !merchant.webhookUrl) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Configure uma URL primeiro' });
        }

        const testPayload = {
          event: 'webhook.test',
          timestamp: new Date().toISOString(),
          data: {
            merchantId: merchant.id,
            message: 'Este é um webhook de teste do ParcelToken'
          }
        };

        // Log webhook
        await db.createWebhookLog({
          merchantId: merchant.id,
          eventType: 'webhook.test',
          payload: testPayload,
          url: merchant.webhookUrl,
          status: 'pending',
          retryCount: 0
        });

        // In production, send actual HTTP request
        // For now, just simulate success
        return { success: true, message: 'Webhook de teste enviado' };
      }),

      list: protectedProcedure
        .input(z.object({ limit: z.number().default(50) }))
        .query(async ({ ctx, input }) => {
          const merchant = await db.getMerchantByUserId(ctx.user.id);
          if (!merchant) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Merchant não encontrado' });
          }
          return db.getWebhookLogs(merchant.id, input.limit);
        }),
    }),
  }),

  // ============= PAYMENT / TRANSACTION ROUTES =============
  payment: router({
    // Execute payment (consumer scans QR and pays)
    execute: protectedProcedure
      .input(z.object({
        qrId: z.number(),
        installments: z.number().min(1).max(12),
        paymentMethod: z.enum(['parceltoken', 'pix', 'card'])
      }))
      .mutation(async ({ ctx, input }) => {
        // Get QR code
        const qr = await db.getSmartQRById(input.qrId);
        if (!qr) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'QR Code nao encontrado'
          });
        }

        if (qr.status !== 'pending') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'QR Code ja foi utilizado ou expirou'
          });
        }

        if (new Date() > qr.expiresAt) {
          await db.updateSmartQRStatus(input.qrId, 'expired');
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'QR Code expirado'
          });
        }

        // Get merchant
        const merchant = await db.getMerchantById(qr.merchantId);
        if (!merchant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Merchant nao encontrado'
          });
        }

        // Calculate amounts
        const amount = qr.amount;
        const feeAmount = Math.floor(amount * ((merchant.feePercentage || 50) / 10000)); // basis points to decimal
        const netAmount = amount - feeAmount;
        const installmentAmount = Math.ceil(amount / input.installments);
        const savings = calculateSavings(amount);

        // Get or validate ParcelToken if using it
        let parcelTokenId = null;
        if (input.paymentMethod === 'parceltoken') {
          const token = await db.getActiveParcelTokenByUserId(ctx.user.id);
          if (!token) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Voce nao possui um ParcelToken ativo'
            });
          }

          if (token.creditLimit - (token.usedAmount || 0) < amount) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Limite de credito insuficiente'
            });
          }

          parcelTokenId = token.id;
          
          // Update token usage
          await db.updateParcelTokenUsage(token.id, amount);
          
          // Update user available credit
          const user = await db.getUserById(ctx.user.id);
          if (user) {
            await db.updateUserCredit(
              ctx.user.id,
              user.creditLimit || 0,
              (user.availableCredit || 0) - amount
            );
          }
        }

        // Create transaction
        const transactionId = await db.createTransaction({
          userId: ctx.user.id,
          merchantId: merchant.id,
          parcelTokenId,
          smartQRId: input.qrId,
          amount,
          feeAmount,
          netAmount,
          savingsAmount: savings,
          installments: input.installments,
          installmentAmount,
          paymentMethod: input.paymentMethod,
          paymentRail: 'PIX', // Simulated instant settlement via PIX
          status: 'processing',
          settledAt: null,
          settlementMethod: null,
          description: qr.description,
          metadata: JSON.stringify({ qrData: qr.qrCode })
        });

        // Generate installments automatically using the engine
        if (input.installments > 1 && transactionId && parcelTokenId) {
          const { generateInstallments } = await import('./installmentEngine');
          await generateInstallments({
            transactionId,
            tokenId: parcelTokenId,
            totalAmount: amount,
            installments: input.installments,
            interestRate: 0, // Sem juros por padrão
            discountRate: 0
          });
        }

        // Simulate instant settlement (in production, would integrate with PIX API)
        if (transactionId) {
          await db.settleTransaction(transactionId, 'PIX');
          await db.updateSmartQRStatus(input.qrId, 'paid');
          await db.updateMerchantStats(merchant.id, netAmount);
          await db.updateUserSavings(ctx.user.id, savings);
        }

        return {
          transactionId,
          status: 'completed',
          amount,
          installments: input.installments,
          installmentAmount,
          savings,
          message: 'Pagamento realizado com sucesso!'
        };
      }),

    // Get payment details
    details: protectedProcedure
      .input(z.object({
        transactionId: z.number()
      }))
      .query(async ({ ctx, input }) => {
        const transaction = await db.getTransactionById(input.transactionId);
        if (!transaction) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Transacao nao encontrada'
          });
        }

        // Check if user owns this transaction
        if (transaction.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Voce nao tem permissao para ver esta transacao'
          });
        }

        return transaction;
      }),
  }),

  // ============= OPEN FINANCE ROUTES =============
  openFinance: router({
    // Criar token de conexão bancária
    createConnectToken: protectedProcedure.mutation(async ({ ctx }) => {
      const { createConnectToken } = await import('./services/openFinance');
      const { connectToken, connectUrl } = await createConnectToken(ctx.user.id);
      return { connectToken, connectUrl };
    }),

    // Salvar conexão após usuário conectar conta
    saveConnection: protectedProcedure
      .input(z.object({
        itemId: z.string(),
        connectorId: z.string().optional(),
        connectorName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createOpenFinanceConnection({
          userId: ctx.user.id,
          itemId: input.itemId,
          connectorId: input.connectorId,
          connectorName: input.connectorName,
        });
        return { success: true };
      }),

    // Sincronizar dados e calcular métricas
    syncData: protectedProcedure.mutation(async ({ ctx }) => {
      const connection = await db.getOpenFinanceConnection(ctx.user.id);
      if (!connection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Nenhuma conta bancária conectada',
        });
      }

      const { getOpenFinanceData } = await import('./services/openFinance');
      const { metrics } = await getOpenFinanceData(connection.itemId);

      await db.updateOpenFinanceMetrics({
        userId: ctx.user.id,
        ...metrics,
      });

      return { success: true, metrics };
    }),

    // Buscar métricas calculadas
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
      const metrics = await db.getOpenFinanceMetrics(ctx.user.id);
      return metrics;
    }),

    // Buscar status da conexão
    getConnection: protectedProcedure.query(async ({ ctx }) => {
      const connection = await db.getOpenFinanceConnection(ctx.user.id);
      return connection;
    }),

    // Usar dados mock para desenvolvimento
    getMockData: protectedProcedure.query(async () => {
      const { getMockOpenFinanceData } = await import('./services/openFinance');
      return getMockOpenFinanceData();
    }),
  }),

  // ============= SMART CREDIT ROUTES =============
  smartCredit: router({
    // Calcular score de crédito dinâmico
    calculateScore: protectedProcedure.query(async ({ ctx }) => {
      const { calculateSmartScore } = await import('./services/smartCredit');
      const score = await calculateSmartScore(ctx.user.id);
      return score;
    }),

    // Atualizar limite automaticamente
    updateLimitAutomatically: protectedProcedure.mutation(async ({ ctx }) => {
      const { updateCreditLimitAutomatically } = await import('./services/smartCredit');
      const result = await updateCreditLimitAutomatically(ctx.user.id);
      return result;
    }),
  }),

  // ============= NOTIFICATION ROUTES =============
  notifications: router({    
    // Listar notificações do usuário
    list: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
        unreadOnly: z.boolean().optional().default(false),
      }))
      .query(async ({ ctx, input }) => {
        const notifications = await db.getUserNotifications(ctx.user.id, input);
        return notifications;
      }),

    // Contar notificações não lidas
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const count = await db.getUnreadNotificationCount(ctx.user.id);
      return { count };
    }),

    // Marcar notificação como lida
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationAsRead(input.notificationId, ctx.user.id);
        return { success: true };
      }),

    // Marcar todas como lidas
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),

    // Deletar notificação
    delete: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteNotification(input.notificationId, ctx.user.id);
        return { success: true };
      }),

    // Obter preferências de notificação
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      const prefs = await db.getNotificationPreferences(ctx.user.id);
      return prefs;
    }),

    // Atualizar preferências de notificação
    updatePreferences: protectedProcedure
      .input(z.object({
        transactionCompleted: z.boolean().optional(),
        installmentPaid: z.boolean().optional(),
        installmentDueSoon: z.boolean().optional(),
        installmentOverdue: z.boolean().optional(),
        tokenCreated: z.boolean().optional(),
        tokenApproved: z.boolean().optional(),
        creditLimitIncreased: z.boolean().optional(),
        webhookReceived: z.boolean().optional(),
        smartqrGenerated: z.boolean().optional(),
        newSale: z.boolean().optional(),
        paymentReceived: z.boolean().optional(),
        systemAnnouncement: z.boolean().optional(),
        emailEnabled: z.boolean().optional(),
        pushEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertNotificationPreferences(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ============= PUBLIC ROUTES (for landing page) =============
  public: router({
    // Get platform stats (for landing page)
    stats: publicProcedure.query(async () => {
      // In production, would aggregate real data
      // For demo, return impressive mock data
      return {
        totalUsers: 12547,
        totalMerchants: 328,
        totalTransactions: 45892,
        totalVolume: 2847500000, // R$ 28.475.000,00 in centavos
        totalSavings: 71187500, // R$ 711.875,00 saved by users
        averageSavings: 2.5, // 2.5% average savings
        conversionRate: 18.5, // 18.5% better conversion than cards
      };
    }),

    // Get active offers
    offers: publicProcedure.query(async () => {
      const offers = await db.getActiveOffers();
      return offers;
    }),

    // Generate demo SmartQR (for landing page demo)
    generateDemoQR: publicProcedure
      .input(z.object({
        amount: z.number().min(1000).max(1000000), // R$ 10 a R$ 10.000
        description: z.string().min(1).max(200),
        maxInstallments: z.number().min(1).max(12).default(4),
      }))
      .mutation(async ({ input }) => {
        // Generate demo QR Code
        const qrId = Math.floor(Math.random() * 1000000);
        const sessionId = `demo-${qrId}-${Date.now()}`;
        const qrPayload = generateSmartQRPayload(
          999, // Demo merchant ID
          input.amount,
          sessionId,
          input.description
        );

        // Generate QR Code images
        const qrCodePNG = await generateQRCodePNG(qrPayload);
        const qrCodeSVG = await generateQRCodeSVG(qrPayload);

        // Calculate installment details
        const installmentAmount = Math.ceil(input.amount / input.maxInstallments);
        const savings = calculateSavings(input.amount);

        return {
          qrId,
          qrCode: qrPayload,
          qrCodePNG,
          qrCodeSVG,
          amount: input.amount,
          description: input.description,
          maxInstallments: input.maxInstallments,
          installmentAmount,
          savings,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
