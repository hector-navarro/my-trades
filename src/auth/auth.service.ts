import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/schemas/user.schema';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async signup(email: string, password: string, name: string): Promise<TokenPair> {
    const user = await this.usersService.create(email, password, name);
    return this.generateTokens(user);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await this.usersService.validatePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.validateUser(email, password);
    return this.generateTokens(user);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('auth.jwtRefreshSecret')
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User): Promise<TokenPair> {
    const payload = { sub: user.id, role: user.role ?? UserRole.USER };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('auth.jwtSecret'),
      expiresIn: this.configService.get<string>('auth.accessExpiresIn')
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('auth.jwtRefreshSecret'),
      expiresIn: this.configService.get<string>('auth.refreshExpiresIn')
    });
    return { accessToken, refreshToken };
  }
}
