import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import config from "../../config";
import prisma from "../../shared/prisma";

export const initiateSuperAdmin = async () => {
  const hashedPassword = await bcrypt.hash(
    "123456789",
    Number(config.bcrypt_salt_rounds)
  );

  const payload: any = {
    fullName: "Super",
    email: "admin@gmail.com",
    password: hashedPassword,
    phoneNumber: "00000000000",
    role: UserRole.ADMIN,
    dob: new Date(),
    otp: 4321,
    expirationOtp: new Date(Date.now() + 60 * 60 * 1000),
    address: "Remote",
    userId: "100001",
    referralCode: "000000"
  };

  const isExistUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isExistUser) return;

  await prisma.user.create({
    data: payload,
  });
};
