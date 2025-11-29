'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Zap } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se já está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      }
      setLoading(false);
    });

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black flex items-center justify-center">
        <div className="animate-pulse">
          <Zap className="w-12 h-12 text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-10 h-10 text-purple-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
              PowerHit15
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Transforme seu corpo em 15 minutos por dia
          </p>
        </div>

        {/* Auth Component */}
        <div className="bg-gradient-to-br from-purple-950/40 to-purple-900/20 rounded-2xl p-6 border border-purple-800/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#a855f7',
                    brandAccent: '#9333ea',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#1f1f1f',
                    defaultButtonBackgroundHover: '#2a2a2a',
                    defaultButtonBorder: '#3f3f3f',
                    defaultButtonText: 'white',
                    dividerBackground: '#3f3f3f',
                    inputBackground: '#1f1f1f',
                    inputBorder: '#3f3f3f',
                    inputBorderHover: '#a855f7',
                    inputBorderFocus: '#a855f7',
                    inputText: 'white',
                    inputLabelText: '#d1d5db',
                    inputPlaceholder: '#6b7280',
                    messageText: 'white',
                    messageTextDanger: '#ef4444',
                    anchorTextColor: '#a855f7',
                    anchorTextHoverColor: '#9333ea',
                  },
                  space: {
                    spaceSmall: '8px',
                    spaceMedium: '12px',
                    spaceLarge: '16px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '14px',
                    baseButtonSize: '14px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Cadastrar',
                  loading_button_label: 'Cadastrando...',
                  social_provider_text: 'Cadastrar com {{provider}}',
                  link_text: 'Não tem uma conta? Cadastre-se',
                },
                forgotten_password: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  button_label: 'Enviar instruções',
                  loading_button_label: 'Enviando...',
                  link_text: 'Esqueceu sua senha?',
                },
              },
            }}
            providers={[]}
            redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Ao continuar, você concorda com nossos termos de uso
        </div>
      </div>
    </div>
  );
}
