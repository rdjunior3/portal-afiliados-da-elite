// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env, validateEnv } from '@/config/env';

// Validate environment variables
validateEnv();

// Enhanced client configuration to resolve timeout issues
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'portal-afiliados-elite',
    },
  },
};

// Create enhanced Supabase client with proper configurations
export const supabase = createClient<Database>(
  env.SUPABASE_URL, 
  env.SUPABASE_ANON_KEY,
  supabaseOptions
);

// Enhanced functions for timeout handling
export const supabaseWithTimeout = {
  // Profile operations with extended timeout
  profiles: {
    async update(data: any, userId: string) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      try {
        const response = await Promise.race([
          supabase
            .from('profiles')
            .update(data)
            .eq('id', userId)
            .select()
            .single(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile update timeout after 30 seconds')), 30000)
          )
        ]);
          
        clearTimeout(timeoutId);
        return response;
      } catch (error: any) {
        clearTimeout(timeoutId);
        throw error;
      }
    }
  },
  
  // Storage operations with extended timeout and retry
  storage: {
    async upload(bucket: string, path: string, file: File, options: any = {}) {
      const fileSizeMB = file.size / (1024 * 1024);
      const timeout = Math.min(60000 + (fileSizeMB * 10000), 180000); // 60s base + 10s per MB, max 3min
      
      try {
        console.log(`📤 [Enhanced Upload] Starting: ${file.name} (${fileSizeMB.toFixed(1)}MB, timeout: ${timeout/1000}s)`);
        
        const response = await Promise.race([
          supabase.storage
            .from(bucket)
            .upload(path, file, {
              ...options,
              cacheControl: '3600',
              upsert: false,
            }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Upload timeout after ${timeout/1000} seconds`)), timeout)
          )
        ]);
          
        console.log(`[SUCCESS] [Enhanced Upload] Success: ${file.name}`);
        return response;
      } catch (error: any) {
        console.error(`[ERROR] [Enhanced Upload] Failed: ${file.name}`, error);
        throw error;
      }
    }
  },
  
  // Auth operations with extended timeout
  auth: {
    async getSession() {
      try {
        const response = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout after 20 seconds')), 20000)
          )
        ]);
        
        return response;
      } catch (error: any) {
        throw error;
      }
    }
  }
};

// Utility function for retry with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`[LOADING] Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Import the supabase client like this:
// import { supabase, supabaseWithTimeout, withRetry } from "@/integrations/supabase/client";