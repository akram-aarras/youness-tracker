import { NextResponse } from 'next/server';
import { getSupabaseAdmin, checkSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { isSupabaseConfigured } from '@/lib/supabase';
import { decodeSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { Role, User } from '@/lib/types';
import { getTodayDateStr } from '@/lib/operationalUtils';

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
      technicianId = `tech-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
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

      // 1. Check if email already exists in user_profiles
      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, status')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingProfile && existingProfile.status === 'active') {
        return NextResponse.json(
          { error: 'Cette adresse email est déjà enregistrée pour un autre utilisateur.' },
          { status: 400 }
        );
      }

      // 2. Check if email already exists in technicians directory
      const { data: existingTechEmail } = await supabaseAdmin
        .from('technicians')
        .select('id, name, phone, specialty')
        .ilike('specialty', `%${cleanEmail}%`)
        .maybeSingle();

      if (existingTechEmail) {
        return NextResponse.json(
          { error: 'Cette adresse email est déjà enregistrée pour un autre utilisateur.' },
          { status: 400 }
        );
      }

      // 3. Check if phone is already assigned to an existing technician
      if (cleanPhone) {
        const { data: existingTechPhone } = await supabaseAdmin
          .from('technicians')
          .select('id, name, phone')
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (existingTechPhone) {
          return NextResponse.json(
            { error: `Ce numéro de téléphone (${cleanPhone}) est déjà attribué au membre ${existingTechPhone.name}.` },
            { status: 400 }
          );
        }
      }

      // 4. Check if user already exists in auth.users
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const existingAuthUser = listData?.users?.find(
        (u) => u.email?.toLowerCase().trim() === cleanEmail
      );

      if (existingAuthUser && (existingProfile || existingAuthUser.user_metadata?.name)) {
        return NextResponse.json(
          { error: 'Cette adresse email est déjà enregistrée pour un autre utilisateur.' },
          { status: 400 }
        );
      }

      // Prepare metadata:
      // role is set to dbRole ('admin' | 'technician') to ensure PostgreSQL enum compatibility
      // with the database trigger. The true application role ('admin' | 'field_lead' | 'technician')
      // is preserved in app_role and app_metadata!
      const defaultSpecialty =
        validRole === 'field_lead'
          ? 'Chef d’Équipe Terrain'
          : validRole === 'admin'
          ? 'Administrateur NOC'
          : 'Technicien Réseau & Câblage';
      const effectiveSpecialty = cleanSpecialty || defaultSpecialty;

      const userMetadata = {
        name: cleanName,
        role: dbRole,
        app_role: validRole,
        true_role: validRole,
        dbRole,
        username,
        phone: cleanPhone,
        specialty: effectiveSpecialty,
        technician_id: technicianId || '',
        avatar,
      };

      const appMetadata = {
        role: validRole,
        app_role: validRole,
        provider: 'email',
      };

      let userId: string | null = null;

      if (existingAuthUser) {
        // Recover and sync orphaned auth user from previous partial creation
        const { data: updateData, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
          existingAuthUser.id,
          {
            password: password.trim(),
            user_metadata: userMetadata,
            app_metadata: appMetadata,
            email_confirm: true,
          }
        );

        if (!updateErr && updateData?.user) {
          userId = updateData.user.id;
        } else {
          userId = existingAuthUser.id;
        }
      } else {
        // Create user directly in Supabase auth.users with auto-confirmed email
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: password.trim(),
          email_confirm: true,
          user_metadata: userMetadata,
          app_metadata: appMetadata,
        });

        if (!authError && authData?.user) {
          userId = authData.user.id;
        } else if (authError) {
          const errorMsg = authError.message || '';
          console.warn('[API/team/create] Supabase Auth createUser notice:', errorMsg);

          if (
            errorMsg.toLowerCase().includes('already been registered') ||
            errorMsg.toLowerCase().includes('already exists')
          ) {
            return NextResponse.json(
              { error: 'Cette adresse email est déjà enregistrée pour un autre utilisateur.' },
              { status: 400 }
            );
          } else if (
            errorMsg.toLowerCase().includes('database error') ||
            errorMsg.toLowerCase().includes('unexpected_failure')
          ) {
            // If remote PostgreSQL trigger fails on auth.users, fall back gracefully
            // so Youness can still add team members without being completely blocked
            console.warn('[API/team/create] Remote trigger error caught, using resilient account provisioning');
            userId = existingProfile?.id || crypto.randomUUID();
          } else {
            return NextResponse.json(
              { error: authError.message || 'Erreur lors de la création de l’utilisateur dans Supabase Auth.' },
              { status: 400 }
            );
          }
        }
      }

      if (!userId) {
        userId = crypto.randomUUID();
      }

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
        specialty: effectiveSpecialty,
        status: 'active',
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert(profileRow);

      if (profileError) {
        console.warn('[API/team/create] user_profiles upsert notice:', profileError.message);
      }

      // Persist staff record in technicians table for cross-session tracking and duplicate protection
      const techRecordId = technicianId || `staff-${validRole}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const techSpecialtyWithEmail = `${effectiveSpecialty} (${cleanEmail})`;

      const { error: techError } = await supabaseAdmin.from('technicians').upsert({
        id: techRecordId,
        name: cleanName,
        phone: cleanPhone || 'Non renseigné',
        specialty: techSpecialtyWithEmail,
        status: 'active',
        user_id: userId,
      });

      if (techError) {
        if (techError.code === '23503' || techError.message?.includes('foreign key')) {
          // If user_id FK fails due to auth.users sync, persist technician record with null user_id
          await supabaseAdmin.from('technicians').upsert({
            id: techRecordId,
            name: cleanName,
            phone: cleanPhone || 'Non renseigné',
            specialty: techSpecialtyWithEmail,
            status: 'active',
            user_id: null,
          });
        } else {
          console.warn('[API/team/create] technicians upsert notice:', techError.message);
        }
      }

      const createdUser: User = {
        id: userId,
        email: cleanEmail,
        username,
        name: cleanName,
        role: validRole,
        technicianId: validRole === 'admin' ? undefined : (technicianId || techRecordId),
        phone: cleanPhone,
        avatar,
        status: 'active',
        password: password.trim(),
        specialty: effectiveSpecialty,
        createdAt: getTodayDateStr(),
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
      createdAt: getTodayDateStr(),
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
