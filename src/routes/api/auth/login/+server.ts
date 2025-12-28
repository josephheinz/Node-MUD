import { supabase } from '$lib/auth/supabaseClient';

export async function POST({ request, cookies }) {
	const { email, password } = await request.json();

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	if (error != null) {
		console.warn(error);
		return Response.json({ success: false, msg: error.message }, { status: error.status });
	}

	if (data.session) {
		cookies.set('supabase.session', JSON.stringify(data.session), {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
			maxAge: data.session.expires_in
		});
	}

	return Response.json({ success: true }, { status: 200 });
}
