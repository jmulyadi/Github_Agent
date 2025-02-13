import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.SUPABASE_ANON;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const getMessages = async () => {
  const { data, error } = await supabase.from("messages").select("*");

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
  return data; // Returns an array of messages
};
