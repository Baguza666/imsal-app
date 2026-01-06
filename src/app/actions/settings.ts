'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateSettings(formData: FormData) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const workspaceId = formData.get('workspace_id') as string;
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;
    const taxId = formData.get('tax_id') as string;
    const logoFile = formData.get('logo') as File;

    let logoUrl = formData.get('current_logo_url') as string;

    // 1. Upload Logo if a new file is present
    if (logoFile && logoFile.size > 0) {
        const fileName = `${workspaceId}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(fileName, logoFile, { upsert: true });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
        } else {
            const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
            logoUrl = data.publicUrl;
        }
    }

    // 2. Update Workspace in Database
    const { error } = await supabase
        .from('workspaces')
        .update({
            name,
            address,
            city,
            country,
            tax_id: taxId,
            logo_url: logoUrl
        })
        .eq('id', workspaceId)
        .eq('owner_id', user.id);

    if (error) console.error('Database Error:', error);

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    revalidatePath('/invoices/new');
}