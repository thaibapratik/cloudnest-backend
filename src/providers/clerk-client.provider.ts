import { createClerkClient } from '@clerk/backend';

export const ClerkClientProvider = {
  provide: 'ClerkClient',
  useFactory: () =>
    createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY || '',
      publishableKey: process.env.CLERK_PUBLIC_KEY || '',
    }),
};
