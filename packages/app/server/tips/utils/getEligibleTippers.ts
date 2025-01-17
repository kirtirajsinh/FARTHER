import { prisma } from "@farther/backend";
import { TIPPER_REQUIRED_FARTHER_BALANCE, WAD_SCALER } from "@farther/common";
import { getHolders } from "../../token/getHolders";

export async function getEligibleTippers() {
  const prevTipMeta = await prisma.tipMeta.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
    include: {
      allowances: true,
    },
  });

  const previousDistributionTime = prevTipMeta
    ? prevTipMeta.createdAt
    : new Date(0);

  const allHolders = await getHolders({ includeLPs: true });

  const eligibleHolders = allHolders.filter(
    (holder) =>
      BigInt(holder.totalBalance) >=
      BigInt(TIPPER_REQUIRED_FARTHER_BALANCE) * WAD_SCALER,
  );

  const existingHolders = await prisma.user.findMany({
    where: {
      id: {
        in: eligibleHolders.map((eh) => eh.fid),
      },
    },
    include: tipperInclude(previousDistributionTime),
  });

  const existingHolderFids = existingHolders.map((eh) => eh.id);

  const newHolderFids = eligibleHolders.filter(
    (eh) => !existingHolderFids.includes(eh.fid),
  );

  const newHolders = await prisma.$transaction(
    newHolderFids.map((user, i) =>
      prisma.user.create({
        data: {
          id: user.fid,
        },
        include: tipperInclude(previousDistributionTime),
      }),
    ),
  );

  return [...existingHolders, ...newHolders].map((holder) => {
    const foundHolder = eligibleHolders.find((eh) => eh.fid === holder.id);
    // This is mainly to silence typescript
    if (!foundHolder) {
      throw new Error(`Holder ${holder.id} not found in eligibleHolders`);
    }
    return {
      ...holder,
      totalBalance: foundHolder.totalBalance.toString(),
    };
  });
}

export async function getExistingTippers() {
  const prevTipMeta = await prisma.tipMeta.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });

  const previousDistributionTime = prevTipMeta
    ? prevTipMeta.createdAt
    : new Date(0);

  return prisma.user.findMany({
    where: {
      tipAllowances: {
        // Will return users that have at least one tip allowance
        some: {},
      },
    },
    include: tipperInclude(previousDistributionTime),
  });
}

export function tipperInclude(previousDistributionTime: Date) {
  return {
    tipAllowances: {
      include: {
        tips: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    },
    tipsGiven: {
      where: {
        createdAt: {
          gte: previousDistributionTime,
        },
        invalidTipReason: null,
      },
      include: {
        tippee: {
          select: {
            tipAllowances: {
              where: {
                createdAt: {
                  gte: previousDistributionTime,
                },
              },
            },
          },
        },
      },
    },
  } as const;
}
