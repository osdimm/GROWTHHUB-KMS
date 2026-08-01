/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string, fallback: string): string => {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch {
    // Ignore error in non-browser context
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return fallback;
};

export const supabaseUrl = getEnvVar(
  'VITE_SUPABASE_URL',
  'https://wixrwqftnvtjbmefbddc.supabase.co'
);

export const supabaseAnonKey = getEnvVar(
  'VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeHJ3cWZ0bnZ0amJtZWZiZGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTkxOTUsImV4cCI6MjEwMTA3NTE5NX0.S4X1oYUFkZzFJYwqMHZB-aLKiMpkGkcCpqMe2pvHsz8'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
