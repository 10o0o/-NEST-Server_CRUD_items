import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/User.entity';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.userRepository = userRepository;
  }

  async findUserWithUserId(userId: string): Promise<User> {
    return await this.userRepository.findOne({ where: { id: userId } });
  }

  async findUserWithEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findUserWithNickname(nickname: string): Promise<User> {
    return await this.userRepository.findOne({ where: { nickname } });
  }

  async validateCredentials(user: User, password: string): Promise<boolean> {
    return compare(password, user.password);
  }

  private checkpassword(pwd) {
    const password = pwd;

    const num = password.search(/[0-9]/g);
    const eng = password.search(/[a-z]/gi);
    const spe = password.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);

    if (password.length < 8 || password.length > 20) {
      return 1;
    }

    if (password.search(/₩s/) != -1) {
      return 2;
    }
    if (num < 0 || eng < 0 || spe < 0) {
      return 3;
    }

    return 0;
  }

  async create(user: CreateUserDto) {
    const { email, phoneNumber, name, password } = user;

    if (!phoneNumber || !name || !email || !password) {
      throw new BadRequestException(
        '이름(name), 비밀번호(password), 이메일(email), 폰번호(phoneNumber) 중 하나 이상이 누락되었습니다.',
      );
    }

    const existingUser = await this.findUserWithEmail(email);

    if (existingUser) {
      throw new UnprocessableEntityException('이미 존재하는 이메일입니다.');
    }

    const checkpwd = this.checkpassword(password);

    if (checkpwd === 1) {
      throw new BadRequestException('비밀번호는 8~20자 입니다.');
    }

    if (checkpwd === 2) {
      throw new BadRequestException('비밀번호에 공백이 있으면 안됩니다.');
    }

    if (checkpwd === 3) {
      throw new BadRequestException(
        '영문, 숫자, 특수문자 3종류가 모두 들어가야 합니다.',
      );
    }

    user.password = await hash(user.password, 10);
    user.phoneNumber =
      phoneNumber.slice(0, 3) +
      ' - ' +
      phoneNumber.slice(3, 7) +
      ' - ' +
      phoneNumber.slice(7);
    user.lastLogin = new Date();

    await this.userRepository.save(user);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
