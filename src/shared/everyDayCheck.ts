import prisma from "./prisma";

export const checkSubscription = async () => {
  const currentDate = new Date();
  const subscriptions = await prisma.payment.findMany({
    where: {
      endDate: {
        lte: currentDate,
      },
    },
  });

  // console.log("Expired subscriptions:", subscriptions);
  if (subscriptions.length > 0) {
    for (const subscription of subscriptions) {
      await prisma.payment.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      });
       
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { isPaid: false },
      });
    }
  }
};

// user age update functionality
export const updateUserAges = async () => {
   const today = new Date();
   const users = await prisma.user.findMany({
      where: {
         dob: {
            not: null,
         },
      },
      select: {
         id: true,
         dob: true,
      },
   });

   for (const user of users) {
      if (!user.dob) continue;
      const birthDate = new Date(user.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
         age--;
      }
      await prisma.user.update({
         where: { id: user.id },
         data: { age },
      });
   }
};

export const updateOfferCodesEveryDay = async () => {
   const today = new Date();
   const offerCodes = await prisma.offerCode.findMany({
      where: {
         expiresAt: {
            lte: today,
         },
         isActive: true,
      },
      select: {
         id: true,
      },
   });

   for (const offer of offerCodes) {
      await prisma.offerCode.update({
         where: { id: offer.id },
         data: { isActive: false },
      });
   }
};