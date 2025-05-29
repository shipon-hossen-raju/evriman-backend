import prisma from "../../../shared/prisma";

const generateCode = () => {
  const randomCode = Math.floor(100000 + Math.random() * 900000);
  const code = `${randomCode}`;
  return code;
};

export async function generateUniquePartnerCode(): Promise<string> {
  let unique = false;
  let partnerCode = "";

  while (!unique) {
    partnerCode = await generateCode();
    const exists = await prisma.partnerCode.findUnique({
       where: { partnerCode },
       select: {
          partnerCode: true
       }
    }
    );

    if (!exists) {
      unique = true;
    }
  }

  return partnerCode;
}
export async function generateUniqueUserId(): Promise<string> {
  let unique = false;
  let userId = "";

  while (!unique) {
    userId = await generateCode();
    const exists = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
      },
    });

    if (!exists) {
      unique = true;
    }
  }

  return userId;
}
