import { createClient } from './src/utils/supabase/client'

async function testConnection() {
  const supabase = createClient()
  console.log('Pinging Supabase profiles table...')
  
  const { data, error } = await supabase
    .from('profiles')
    .select('count')
    .limit(1)
  
  if (error) {
    console.error('Connection failed:', error.message)
    process.exit(1)
  }
  
  console.log('Connection successful! Profiles table is reachable.')
  process.exit(0)
}

testConnection()
