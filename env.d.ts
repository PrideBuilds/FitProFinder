/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_BASE_URL: string;
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_COMETCHAT_APP_ID: string;
  readonly PUBLIC_COMETCHAT_REGION: string;
  readonly PUBLIC_COMETCHAT_AUTH_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  readonly PUBLIC_POSTHOG_KEY: string;
  readonly PUBLIC_POSTHOG_HOST: string;
  readonly NEXT_PUBLIC_POSTHOG_KEY: string;
  readonly NEXT_PUBLIC_POSTHOG_HOST: string;
  readonly EMAIL_USER: string;
  readonly EMAIL_PASS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}