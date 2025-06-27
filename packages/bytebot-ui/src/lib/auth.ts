import { createAuthClient } from 'better-auth/react';

const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';

export const authClient = authEnabled ? createAuthClient() : null;

const nullAuthActions = {
  signIn: {
    email: () => Promise.resolve({ error: { message: 'Auth not enabled' } }),
    social: () => Promise.resolve({ error: { message: 'Auth not enabled' } })
  },
  signUp: {
    email: () => Promise.resolve({ error: { message: 'Auth not enabled' } })
  },
  signOut: () => Promise.resolve(null),
  useSession: () => ({ data: null, isPending: false, error: null }),
  getSession: () => Promise.resolve(null),
};

export const signIn = authClient?.signIn || nullAuthActions.signIn;
export const signUp = authClient?.signUp || nullAuthActions.signUp;
export const signOut = authClient?.signOut || nullAuthActions.signOut;
export const useSession = authClient?.useSession || nullAuthActions.useSession;
export const getSession = authClient?.getSession || nullAuthActions.getSession;
