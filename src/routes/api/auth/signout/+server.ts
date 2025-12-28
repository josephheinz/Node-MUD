import { supabase } from '$lib/auth/supabaseClient';

export async function POST({ cookies }) {
	const { error } = await supabase.auth.signOut();

	if (error) {
		console.warn(error);
		return Response.json({ success: false, msg: error.message }, { status: error.status });
	}

	cookies.delete('supabase.session', { path: '/' });

	return Response.json({ success: true }, { status: 200 });
}
