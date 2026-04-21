import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  console.log('Supabase initialized with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: true,
      }
    }
  )
}
