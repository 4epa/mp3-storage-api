import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginUserGTO, RegisterUserGTO } from './dto';
import { ERRORS } from './errors';
import { generateUUID } from 'src/utils/generateUUID';
import { checkPassword, hashPassword } from 'src/utils/hashPassword';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async registerUser(data: RegisterUserGTO) {
    const existEmailUser = await this.userService.user({ email: data.email });
    if (existEmailUser) throw new BadRequestException(ERRORS.existEmail);

    const existNicknameUser = await this.userService.user({
      nickname: data.nickname,
    });
    if (existNicknameUser) throw new BadRequestException(ERRORS.existNickname);

    const uid = generateUUID();
    const hash = await hashPassword(data.password);

    return this.userService.createUser({
      email: data.email,
      nickname: data.nickname,
      hash: hash,
      uid: uid,
    });
  }

  async loginUser(data: LoginUserGTO) {
    const existUser = await this.userService.user({ email: data.email });
    if (!existUser) throw new BadRequestException(ERRORS.notExistEmail);

    const password = data.password;
    const hash = existUser.hash;

    const validatePassword = await checkPassword(password, hash);
    if (!validatePassword) throw new BadRequestException(ERRORS.wrongData);

    return this.userService.activeUser({ email: data.email });
  }
}
