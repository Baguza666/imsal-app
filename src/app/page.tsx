'use client';
import { createBrowserClient } from '@supabase/ssr'; // <--- The correct library
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Initialize the client that handles PKCE automatically
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // This ensures Supabase sends a Code (?code=), not a Token (#token)
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("✅ Success! Please check your email now.");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-surface-app">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-5xl font-heading font-bold text-text-hero tracking-tight">
            IMSAL
          </h1>
          <p className="text-text-muted font-mono text-sm uppercase tracking-widest mt-2">
            Command Center Access
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="ceo@imsal.ma"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface-input border border-border-subtle text-text-hero p-4 rounded-sm focus:border-brand-gold focus:outline-none font-mono text-sm placeholder:text-text-muted"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-gold text-surface-app font-bold rounded-sm hover:bg-white transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {message && (
          <div className="p-4 bg-surface-card border border-brand-gold/20 text-brand-gold text-sm font-mono">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}