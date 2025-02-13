import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.SUPABASE_ANON;
