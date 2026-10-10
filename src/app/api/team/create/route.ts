import { NextResponse } from 'next/server';
import { getSupabaseAdmin, checkSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { isSupabaseConfigured } from '@/lib/supabase';
import { decodeSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { Role, User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    // 1. Authorize: only authenticated admins may create team members
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').filter(Boolean).map((c) => {
        const [k, ...v] = c.split('=');
        return [k, v.join('=')];
      })
    );
    const sessionToken = cookies[SESSION_COOKIE_NAME];
    const session = sessionToken ? decodeSession(sessionToken) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Action non autorisée. Seul un administrateur peut créer des membres d’équipe.' },
        { status: 403 }
      );
    }

    // 2. Parse & Validate request body
    const body = await request.json();
    const { name, email, password, role = 'technician', phone, specialty } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom complet du membre est obligatoire.' },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Une adresse email valide est obligatoire.' },
        { status: 400 }
      );
    }

    if (!password || password.trim().length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit comporter au moins 6 caractères.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const username = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '_');
    const validRole: Role = role === 'admin' ? 'admin' : role === 'field_lead' ? 'field_lead' : 'technician';
    // DB user_role enum supports ('admin', 'technician')
    const dbRole: 'admin' | 'technician' = validRole === 'admin' ? 'admin' : 'technician';
    const avatar = validRole === 'admin' ? '👨‍💼' : '🔧';
    const cleanPhone = phone ? String(phone).trim() : '';
    const cleanSpecialty = specialty ? String(specialty).trim() : undefined;

    let technicianId: string | undefined = undefined;
    if (validRole === 'technician' || validRole === 'field_lead') {
      technicianId = `tech-${Date.now().toString().slice(-4)}`;
    }

    // 3. Supabase Admin User Creation
    if (isSupabaseConfigured) {
      if (!checkSupabaseAdminConfigured()) {
        return NextResponse.json(
          {
            error:
              'Variable SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local. ' +
              'La clé de service Supabase (Service Role Key) est requise pour créer des comptes utilisateurs confirmés dans Supabase Auth.',
            code: 'MISSING_SERVICE_ROLE_KEY',
          },
          { status: 500 }
        );
      }

      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: 'Impossible d’initialiser le client d’administration Supabase.' },
          { status: 500 }
        );
      }

      // Check if email already exists in user_profiles
      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json(
          { error: 'Cette adresse email est déjà enregistrée pour un autre utilisateur.' },
          { status: 400 }
        );
      }

      // Create user directly in Supabase auth.users with auto-confirmed email
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password.trim(),
        email_confirm: true,
        user_metadata: {
          name: cleanName,
          role: validRole,
          dbRole,
          username,
          phone: cleanPhone,
          specialty: cleanSpecialty || (validRole === 'field_lead' ? 'Chef d’Équipe Terrain' : 'Technicien Réseau & Câblage'),
          technician_id: technicianId || '',
          avatar,
        },
      });

      if (authError || !authData.user) {
        console.error('[API/team/create] supabaseAdmin.auth.admin.createUser error:', authError);
        return NextResponse.json(
          { error: authError?.message || 'Erreur lors de la création de l’utilisateur dans Supabase Auth.' },
          { status: 400 }
        );
      }

      const userId = authData.user.id;

      // Upsert profile in user_profiles table
      const profileRow = {
        id: userId,
        email: cleanEmail,
        username,
        name: cleanName,
        role: dbRole,
        technician_id: technicianId || null,
        phone: cleanPhone || null,
        avatar,
        specialty: cleanSpecialty || (validRole === 'field_lead' ? 'Chef d’Équipe Terrain' : 'Technicien Réseau & Câblage'),
        status: 'active',
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert(profileRow);

      if (profileError) {
        console.warn('[API/team/create] user_profiles upsert warning:', profileError.message);
      }

      // If technician, also link into technicians table
      if (technicianId) {
        const { error: techError } = await supabaseAdmin.from('technicians').upsert({
          id: technicianId,
          name: cleanName,
          phone: cleanPhone,
          specialty: cleanSpecialty || (validRole === 'field_lead' ? 'Chef d’Équipe Terrain' : 'Technicien Réseau & Câblage'),
          status: 'active',
          user_id: userId,
        });

        if (techError) {
          console.warn('[API/team/create] technicians upsert warning:', techError.message);
        }
      }

      const createdUser: User = {
        id: userId,
        email: cleanEmail,
        username,
        name: cleanName,
        role: validRole,
        technicianId,
        phone: cleanPhone,
        avatar,
        status: 'active',
        password: password.trim(),
        specialty: cleanSpecialty,
        createdAt: new Date().toISOString().split('T')[0],
      };

      return NextResponse.json({
        success: true,
        user: createdUser,
      });
    }

    // 4. Fallback for purely local/demo mode without Supabase configured
    const localId = `user-${validRole === 'admin' ? 'admin' : 'tech'}-${Date.now().toString().slice(-4)}`;
    const localUser: User = {
      id: localId,
      email: cleanEmail,
      username,
      name: cleanName,
      role: validRole,
      technicianId,
      phone: cleanPhone,
      avatar,
      status: 'active',
      password: password.trim(),
      specialty: cleanSpecialty,
      createdAt: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({
      success: true,
      user: localUser,
    });
  } catch (error) {
    console.error('[API/team/create] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Une erreur serveur inattendue est survenue lors de la création du compte.' },
      { status: 500 }
    );
  }
}
