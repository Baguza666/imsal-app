'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// 1. MARK INVOICE AS PAID
export async function markInvoiceAsPaid(invoiceId: string) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { error } = await supabase
        .from('invoices')
        .update({ status: 'Paid' })
        .eq('id', invoiceId);

    if (error) {
        console.error('Error updating invoice:', error);
        return { success: false, message: 'Failed to update invoice' };
    }

    // Refresh data on all relevant pages
    revalidatePath('/dashboard');
    revalidatePath('/invoices');
    return { success: true, message: 'Invoice marked as paid' };
}

// 2. CREATE FULL INVOICE (Header + Items)
export async function createFullInvoice(formData: any, items: any[]) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // A. Get User's Workspace
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (!workspace) return { error: 'No workspace found' };

    // B. Create Invoice Header
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
            workspace_id: workspace.id,
            client_id: formData.client_id,
            invoice_number: formData.invoice_number,
            status: formData.status, // 'Draft', 'Pending', 'Paid'
            due_date: formData.due_date,
            total_amount: formData.total_amount,
        })
        .select()
        .single();

    if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        return { error: 'Failed to create invoice' };
    }

    // C. Prepare and Insert Invoice Items
    // We map the UI items to the database schema
    const itemsToInsert = items.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id || null, // Null if it's a custom line item
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: Number(item.quantity) * Number(item.unit_price)
    }));

    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

    if (itemsError) {
        console.error('Error creating items:', itemsError);
        // Optional: You could delete the invoice header here to prevent "ghost" invoices
        await supabase.from('invoices').delete().eq('id', invoice.id);
        return { error: 'Failed to save items' };
    }

    // D. Refresh Data
    revalidatePath('/dashboard');
    revalidatePath('/invoices');

    return { success: true, invoiceId: invoice.id };
}