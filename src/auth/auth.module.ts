import { Module } from '@nestjs/common';
import { ClerkStrategy } from './clerk.strategy';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';

@Module({
  providers: [ClerkStrategy, ClerkClientProvider],
})
export class AuthModule {}
