import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwt, { JwtPayload } from 'jsonwebtoken';

type RequestWithAdmin = {
  headers?: Record<string, string | string[] | undefined>;
  adminSession?: {
    email: string;
    role: string;
  };
};

@Injectable()
export class AdminSessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAdmin>();

    const token =
      this.extractBearerToken(request) || this.extractCookieToken(request);

    if (!token) {
      throw new UnauthorizedException('Admin session required.');
    }

    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!secret || secret.length < 32) {
      throw new UnauthorizedException(
        'ADMIN_SESSION_SECRET is missing or too short.',
      );
    }

    try {
      const payload = jwt.verify(token, secret) as JwtPayload;

      if (payload.role !== 'admin') {
        throw new UnauthorizedException('Invalid admin role.');
      }

      request.adminSession = {
        email: typeof payload.email === 'string' ? payload.email : '',
        role: typeof payload.role === 'string' ? payload.role : 'admin',
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired admin session.');
    }
  }

  private extractBearerToken(request: RequestWithAdmin) {
    const raw = request.headers?.authorization;

    if (!raw || Array.isArray(raw)) return null;
    if (!raw.startsWith('Bearer ')) return null;

    return raw.slice('Bearer '.length).trim();
  }

  private extractCookieToken(request: RequestWithAdmin) {
    const rawCookie = request.headers?.cookie;

    if (!rawCookie || Array.isArray(rawCookie)) return null;

    const cookies = rawCookie.split(';').map((part) => part.trim());
    const target = cookies.find((item) =>
      item.startsWith('qubi_admin_session='),
    );

    if (!target) return null;

    return decodeURIComponent(target.slice('qubi_admin_session='.length));
  }
}
