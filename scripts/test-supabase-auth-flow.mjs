#!/usr/bin/env node
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const email = `vex.test.${Date.now()}@example.com`;
const password = "VexTest!12345";

console.log("Testing Supabase signup with:", { email, redirect: "https://vex.md/confirm" });

const signup = await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: "https://vex.md/confirm" },
});

console.log(
  "SIGNUP_RESULT",
  JSON.stringify(
    {
      email,
      error: signup.error
        ? {
            message: signup.error.message,
            status: signup.error.status,
            code: signup.error.code,
            name: signup.error.name,
          }
        : null,
      hasUser: Boolean(signup.data?.user),
      hasSession: Boolean(signup.data?.session),
    },
    null,
    2,
  ),
);

const login = await supabase.auth.signInWithPassword({ email, password });
console.log(
  "LOGIN_RESULT",
  JSON.stringify(
    {
      error: login.error
        ? {
            message: login.error.message,
            status: login.error.status,
            code: login.error.code,
            name: login.error.name,
          }
        : null,
      hasSession: Boolean(login.data?.session),
    },
    null,
    2,
  ),
);
