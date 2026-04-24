import { z } from 'zod';

const envSchema = z.object({
  CONTENTOPS_DB_PATH: z.string().default('./data/contentops.db'),
  CONTENTOPS_DEMO_MODE: z.coerce.boolean().default(false),
  CONTENTOPS_ANTHROPIC_MODEL: z.string().default('claude-haiku-4-5'),
  CONTENTOPS_DAILY_SPEND_CEILING_USD: z.coerce.number().default(2),
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
