import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ActiveUserResponseDTO } from '../user/dto';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateJwtToken(data: ActiveUserResponseDTO) {
    const payload = { user: data };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });
  }
}
