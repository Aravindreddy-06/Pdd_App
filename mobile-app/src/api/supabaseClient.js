import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://yvzoyodkolevobhdgexe.supabase.co';
const supabaseAnonKey = 'sb_publishable_e3F_pBjBDFLUS1Hm9tn8bA_20AK26sZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
