
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xlfwzudharffupfllhga.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZnd6dWRoYXJmZnVwZmxsaGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDM0NDAsImV4cCI6MjA2NTY3OTQ0MH0.rVYhGQr-Iy_IdmggXF6ibXCJbu1EBF0v4mLXw5Wrg00'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
