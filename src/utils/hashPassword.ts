import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  if (!/^\$2a\$\d+\$/.test(password)) {
    password = await bcrypt.hash(password, salt);
  }

  return password;
}

export async function checkPassword(
  plainPassword: string,
  hashed: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashed);
}
