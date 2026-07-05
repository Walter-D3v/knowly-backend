import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { SupabaseJwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private jwks: JWTVerifyGetKey | undefined;

  constructor(private readonly configService: ConfigService) {}

  async validateToken(token: string): Promise<AuthenticatedUser> {
    try {
      const { alg } = decodeProtectedHeader(token);

      const payload =
        alg === 'HS256'
          ? this.verifyLegacySecret(token)
          : await this.verifyAsymmetric(token);

      if (!payload.sub) {
        throw new UnauthorizedException('Token is missing a subject claim');
      }

      return {
        id: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
        role: typeof payload.role === 'string' ? payload.role : undefined,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.debug(`Token validation failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  extractTokenFromHeader(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    return token;
  }

  /** Legacy shared-secret projects sign session JWTs with HS256. */
  private verifyLegacySecret(token: string): SupabaseJwtPayload {
    const secret = this.configService.getOrThrow<string>('SUPABASE_JWT_SECRET');
    return jwt.verify(token, secret) as SupabaseJwtPayload;
  }

  /**
   * Modern Supabase projects sign session JWTs with an asymmetric key
   * (ES256/RS256). The public keys are published on the project's JWKS
   * endpoint, so we verify locally without a legacy shared secret.
   */
  private async verifyAsymmetric(token: string): Promise<JWTPayload> {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    const issuer = `${supabaseUrl}/auth/v1`;

    this.jwks ??= createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );

    const { payload } = await jwtVerify(token, this.jwks, { issuer });
    return payload;
  }
}
