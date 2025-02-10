import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginUserGTO, RegisterUserGTO } from './dto';
import { ERRORS } from './errors';
import { generateUUID } from 'src/utils/generateUUID';
import { checkPassword, hashPassword } from 'src/utils/hashPassword';
import { TokenService } from '../token/token.service';
import { ActiveUserResponseDTO } from '../user/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async registerUser(data: RegisterUserGTO) {
    const existEmailUser = await this.userService.user({ email: data.email });
    if (existEmailUser) throw new BadRequestException(ERRORS.existEmail);

    const existNicknameUser = await this.userService.user({
      nickname: data.nickname,
    });
    if (existNicknameUser) throw new BadRequestException(ERRORS.existNickname);

    const uid = generateUUID();
    const hash = await hashPassword(data.password);
    const date = new Date();

    const createdAt = date.toISOString();

    const activeUser = await this.userService.createUser({
      email: data.email,
      nickname: data.nickname,
      hash: hash,
      uid: uid,
      createdAt: createdAt,
      updatedAt: createdAt,
    });
    const token = await this.tokenService.generateJwtToken(activeUser);
    return { activeUser, token };
  }

  async loginUser(data: LoginUserGTO) {
    const existUser = await this.userService.user({ email: data.email });
    if (!existUser) throw new BadRequestException(ERRORS.notExistEmail);

    const password = data.password;
    const hash = existUser.hash;

    const validatePassword = await checkPassword(password, hash);
    if (!validatePassword) throw new BadRequestException(ERRORS.wrongData);

    const activeUser = (await this.userService.activeUser({
      email: data.email,
    })) as ActiveUserResponseDTO;
    const token = await this.tokenService.generateJwtToken(activeUser);
    return { activeUser, token };
  }

  async verifyUserPayload(email: string) {
    const existUser = await this.userService.user({ email: email });
    if (!existUser)
      throw new UnauthorizedException(
        `There isn't any user with email: ${email}`,
      );

    return existUser;
  }
}
