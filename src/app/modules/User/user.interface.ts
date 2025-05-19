import { UserRole, UserStatus } from "@prisma/client";

export interface IUser {
  id?: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  address: string;
  phoneNumber?: string;
  dob?: Date;
  idDocument?: string; 
  referralCode?: string;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  isVerified?: boolean;
  isDeceased?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  loginType: string;
}

export type IUserFilterRequest = {
  fullName?: string | undefined;
  email?: string | undefined;
  phoneNumber?: string | undefined;
  searchTerm?: string | undefined;
};