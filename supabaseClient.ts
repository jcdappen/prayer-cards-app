
import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string = 'https://wrcnubaubjkxjxosmbp.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyY251YmFtdWJqa3hqeG9zbWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTUzNzQsImV4cCI6MjA2OTE5MTM3NH0.BxOBByRwUCI7vD1xgZGMkUARrpELP40OZP0U2BVGg_M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
