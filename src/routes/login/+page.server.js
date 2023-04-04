import { redirect, fail } from '@sveltejs/kit';
import { authenticate } from '$lib/api';

export const actions = {
  default: async ({ cookies, request }) => {
    const data = await request.formData();
    const password = data.get('password');
    const sessionTimeout = 60 * 24 * 7; // one week in minutes
    try {
      const { sessionId } = await authenticate(password, sessionTimeout);
      cookies.set('sessionid', sessionId);
    } catch (err) {
      console.error(err);
      return fail(400, { incorrect: true });
    }
    throw redirect(303, '/');
  }
};
