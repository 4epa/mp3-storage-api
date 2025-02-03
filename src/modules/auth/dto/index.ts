import { IsString } from 'class-validator';

export class RegisterUserGTO {
  @IsString()
  nickname: string;

  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class LoginUserGTO {
  @IsString()
  email: string;

  @IsString()
  password: string;
}
