'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const InvoiceSchema = z.object({
	id: z.string(),
	customerId: z.string({
		invalid_type_error: 'お客様を選択してください。',
	}),
	amount: z.coerce
		.number()
		.gt(0, { message: '$0より大きい金額を入力してください。' }),
	status: z.enum(['pending', 'paid'], {
		invalid_type_error: '請求書のステータスを選択してください。',
	}),
	date: z.string(),
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceSchema.omit({ date: true, id: true });

export type State = {
	errors?: {
		customerId?: string[];
		amount?: string[];
		status?: string[];
	};
	message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
	const validatedFields = CreateInvoice.safeParse({
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'フィールドがありません。請求書の作成に失敗しました',
		};
	}

  const { customerId, amount, status } = validatedFields.data;
	const amountInCents = amount * 100;
	const date = new Date().toISOString().split('T')[0];

	try {
		await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES(${customerId}, ${amountInCents}, ${status}, ${date})
    `;
	} catch (error) {
		return { message: 'Database Error: Failed to create invoice.' };
	}

	revalidatePath('/dashboard/invoices');
	redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
	const validatedFields = UpdateInvoice.safeParse({
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'フィールドがありません。請求書の作成に失敗しました',
		};
	}

  const{ customerId, amount, status } = validatedFields.data;

	const amountInCents = amount * 100;

	try {
		await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
	} catch (error) {
		return { message: 'Database Error: Failed to update invoice.' };
	}
	revalidatePath('/dashboard/invoices');
	redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
	try {
		await sql`DELETE FROM invoices WHERE id = ${id}`;
		revalidatePath('/dashboard/invoices');
		return { message: 'Invoice deleted successfully.' };
	} catch (error) {
		return { message: 'Database Error: Failed to delete invoice.' };
	}
}
