import { prisma } from "@farther/backend";
import { tipperInclude } from "./getEligibleTippers";
import { getUniqueTippees } from "./getUniqueTippees";

describe("getUniqueTipees", () => {
  it("returns the unique number of tippees for a given tipper fid", async () => {
    const TIPPER_ID = 0;
    const userIds = [0, 1, 2, 3, 4, 5];
    const tipRecipientIds = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 5, 5, 5, 5];

    await prisma.$transaction(async () => {
      for (const id of userIds) {
        await prisma.user.create({
          data: {
            id,
          },
        });
      }

      // Give the tipper a tip allowance
      const tipAllowance = await prisma.tipAllowance.create({
        data: {
          amount: 100000,
          userId: TIPPER_ID,
          userBalance: "42069",
        },
      });

      // Give 2 of the tippees a tip allowance
      for (let id = 1; id < 3; id++) {
        await prisma.tipAllowance.create({
          data: {
            amount: 100000,
            userId: id,
            userBalance: "42069",
          },
        });
      }

      // Send tips from the tipper
      for (const tippeeId of tipRecipientIds) {
        await prisma.tip.create({
          data: {
            hash: `0x${Math.random()}`,
            amount: 1,
            tipper: {
              connect: {
                id: TIPPER_ID,
              },
            },
            tippee: {
              connectOrCreate: {
                where: { id: tippeeId },
                create: { id: tippeeId },
              },
            },
            tipAllowance: {
              connect: {
                id: tipAllowance.id,
              },
            },
          },
        });
      }
    });

    const allTips = await prisma.tip.findMany({
      where: {
        tipperId: TIPPER_ID,
      },
    });

    const tipper = await prisma.user.findFirst({
      where: {
        id: TIPPER_ID,
      },
      include: tipperInclude(new Date(0)),
    });

    if (!tipper) {
      throw new Error("Tipper not found");
    }

    const uniqueTipees = await getUniqueTippees(tipper.tipsGiven);

    expect(allTips.length).toBe(14);
    expect(uniqueTipees).toBe(3);
  });
});
