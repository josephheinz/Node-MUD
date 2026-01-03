/* import { supabase } from '$lib/auth/supabaseClient';

export async function GET({ params, cookies, locals }) {
	const { id } = params;

	const user = locals.user;

	if (!user || user?.id !== id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

	const { data, error } = await supabase.from('actions').select('*').eq('player_id', id).single();

    if(error) throw new Error(error.message);

    if(data){

    }
}
 */