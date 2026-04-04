import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfpiizuovdhbbgkugxyy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmcGlpenVvdmRoYmJna3VneHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzM1NTksImV4cCI6MjA5MDY0OTU1OX0.jfO0NP_EYRqq37cOwnXttbDHIPY47-rgs-KnY4NtRHA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Logging in...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'super_admin@diamondscent.com',
    password: 'AdminPassword2026!'
  });
  console.log('Login error:', error);
}

main();
