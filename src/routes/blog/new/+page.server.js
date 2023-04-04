export async function load({ locals }) {
  const currentUser = locals.user;
  return {
    currentUser
  };
}
