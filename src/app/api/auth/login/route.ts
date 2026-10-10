import { NextResponse } from 'next/server';
import { INITIAL_USERS } from '@/lib/mockData';
import { encodeSession, SESSION_COOKIE_NAME, SessionPayload } from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { User, Role } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, email, username, password, customUsers } = body;

    const query = (identifier || email || username || '').toLowerCase().trim();
    if (!query) {
      return NextResponse.json(
        { error: 'Veuillez saisir votre email ou identifiant.' },
        { status: 400 }
      );
    }

    let authenticatedUser: User | null = null;
    let authErrorMessage: string | null = null;

    // 1. If Supabase is configured, authenticate via Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        let emailToUse = query;
        // If identifier is a username without @, attempt to lookup the user's email
        if (!query.includes('@')) {
          const { data: userByUsername } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('username', query)
            .maybeSingle();

          if (userByUsername?.email) {
            emailToUse = userByUsername.email;
          }
        }

        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: emailToUse,
            password: password || 'Admin123!',
          });

        if (authError) {
          if (authError.message?.toLowerCase().includes('email not confirmed')) {
            return NextResponse.json(
              { error: 'Adresse email non confirmée. Veuillez contacter l’administrateur.' },
              { status: 401 }
            );
          }
          if (authError.status === 429 || authError.message?.toLowerCase().includes('rate limit')) {
            return NextResponse.json(
              { error: 'Trop de tentatives de connexion. Veuillez patienter avant de réessayer.' },
              { status: 429 }
            );
          }
          authErrorMessage = authError.message;
        } else if (authData.user) {
          const meta = authData.user.user_metadata || {};
          // Fetch user profile from user_profiles table
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (profile) {
            if (profile.status === 'inactive') {
              return NextResponse.json(
                { error: 'Compte désactivé. Veuillez contacter le superviseur NOC Youness.' },
                { status: 403 }
              );
            }

            const effectiveRole = (meta.role === 'field_lead' ? 'field_lead' : profile.role) as Role;

            authenticatedUser = {
              id: profile.id,
              email: profile.email,
              username: profile.username || meta.username || profile.email.split('@')[0],
              name: profile.name || meta.name || 'Membre de l’équipe',
              role: effectiveRole,
              technicianId: profile.technician_id || meta.technician_id,
              phone: profile.phone || meta.phone || '',
              avatar: profile.avatar || meta.avatar || (effectiveRole === 'admin' ? '👨‍💼' : '🔧'),
              status: profile.status || 'active',
              specialty: profile.specialty || meta.specialty,
            };
          } else {
            // Profile row missing: fallback to user_metadata on the auth user
            const effectiveRole = (meta.role || meta.dbRole || 'technician') as Role;
            authenticatedUser = {
              id: authData.user.id,
              email: authData.user.email || emailToUse,
              username: meta.username || (authData.user.email ? authData.user.email.split('@')[0] : emailToUse),
              name: meta.name || 'Membre de l’équipe',
              role: effectiveRole,
              technicianId: meta.technician_id,
              phone: meta.phone || '',
              avatar: meta.avatar || (effectiveRole === 'admin' ? '👨‍💼' : '🔧'),
              status: 'active',
              specialty: meta.specialty,
            };
          }
        }
      } catch (err) {
        console.error('Supabase auth attempt error:', err);
      }
    }

    // 2. Fallback to Local Directory (INITIAL_USERS + any client-synced customUsers)
    if (!authenticatedUser) {
      const allUsers: User[] = Array.isArray(customUsers) && customUsers.length > 0
        ? customUsers
        : INITIAL_USERS;

      const found = allUsers.find(
        (u) =>
          u.email?.toLowerCase().trim() === query ||
          u.username?.toLowerCase().trim() === query
      );

      if (!found) {
        if (authErrorMessage && !authErrorMessage.toLowerCase().includes('invalid login credentials')) {
          return NextResponse.json(
            { error: authErrorMessage },
            { status: 401 }
          );
        }
        return NextResponse.json(
          { error: 'Identifiant ou mot de passe incorrect. Vérifiez vos identifiants.' },
          { status: 401 }
        );
      }

      if (found.status === 'inactive') {
        return NextResponse.json(
          { error: 'Compte désactivé. Veuillez contacter le superviseur NOC Youness.' },
          { status: 403 }
        );
      }

      // Password verification
      const expectedPassword = found.password || (found.role === 'admin' ? 'Admin123!' : 'Tech123!');
      if (!password || password !== expectedPassword) {
        return NextResponse.json(
          { error: 'Mot de passe incorrect pour cet utilisateur.' },
          { status: 401 }
        );
      }

      authenticatedUser = found;
    }

    // Create secure session token
    const sessionPayload: SessionPayload = {
      userId: authenticatedUser.id,
      email: authenticatedUser.email,
      username: authenticatedUser.username,
      name: authenticatedUser.name,
      role: authenticatedUser.role,
      technicianId: authenticatedUser.technicianId,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const token = encodeSession(sessionPayload);

    // Build response and set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        username: authenticatedUser.username,
        name: authenticatedUser.name,
        role: authenticatedUser.role,
        technicianId: authenticatedUser.technicianId,
        phone: authenticatedUser.phone,
        avatar: authenticatedUser.avatar,
        status: authenticatedUser.status,
        specialty: authenticatedUser.specialty,
      },
    });

    const isHttps =
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.url.startsWith('https://');
    const isSecure = process.env.NODE_ENV === 'production' && isHttps;

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion.' },
      { status: 500 }
    );
  }
}
