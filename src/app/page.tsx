'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) alert(error.message);
    else alert('Lien de connexion envoyé ! Vérifiez vos emails.');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#f4b943] rounded-full blur-[120px] opacity-10"></div>

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">IMSAL<span className="text-[#f4b943]">SERVICES</span></h1>
          <p className="text-[#a1a1aa] text-sm uppercase tracking-widest">Portail de Gestion</p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/10 backdrop-blur-xl bg-white/5 space-y-6">

          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black font-bold h-12 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Continuer avec Google
          </button>

          <div className="flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs text-[#a1a1aa] uppercase">Ou par email</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {/* EMAIL FORM */}
          <form onSubmit={handleMagicLink} className="space-y-4">
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 h-12 text-white outline-none focus:border-[#f4b943] transition-colors"
              required
            />
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#f4b943] to-[#edc967] text-black font-bold h-12 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Recevoir le lien magique'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}