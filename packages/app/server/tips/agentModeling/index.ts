import "../../scripts/assertLocalhost";

import { prisma } from "@farther/backend";
import { TIPS_DURATION_DAYS } from "@farther/common";
import { distributeAllowances } from "../utils/distributeAllowances";
import { handleTip } from "../utils/handleTip";
import { FIDS_TO_WATCH, behaviors } from "./config";
import { dummyCast } from "./dummyCast";

const USER_SELECTION = {
  id: true,
  tipAllowances: {
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  },
  tipsGiven: true,
  behavior: true,
} as const;

async function tipsAgentModeling() {
  for (let day = 1; day < TIPS_DURATION_DAYS; day++) {
    console.info(`\nDay ${day}.`);

    await distributeAllowances();

    await pause(1000);

    const tippers = await prisma.user.findMany({
      where: {
        tipAllowances: {
          some: {},
        },
      },
      select: USER_SELECTION,
    });

    /**
     * Send tips
     */
    const tipMeta = await prisma.tipMeta.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        tipMinimum: true,
      },
    });

    if (!tipMeta) {
      throw new Error("No tipMeta found");
    }

    const { tipMinimum } = tipMeta;

    for (const tipper of tippers) {
      const behavior = behaviors[tipper.behavior];
      const spendRatio =
        behavior.spendRatios[(day - 1) % behavior.spendRatios.length];

      let remainingAllowance = tipper.tipAllowances[0].amount * spendRatio;

      if (FIDS_TO_WATCH.includes(tipper.id)) {
        console.log(
          `Tipper ${tipper.id} allowance ${tipper.tipAllowances[0].amount}. (behavior: ${tipper.behavior})`,
        );
      }

      let i = 0;
      while (remainingAllowance > tipMinimum) {
        let tipAmount = tipMinimum;

        const tippeeFids =
          behavior.tippeeIds[(day - 1) % behavior.tippeeIds.length];
        const tippeeFid = tippeeFids[i % tippeeFids.length];

        const dummyCastData = dummyCast({
          tipperFid: tipper.id,
          tippeeFid: tippeeFid,
          amount: tipAmount,
        });

        await handleTip({
          castData: dummyCastData.data as any,
          createdAtMs: dummyCastData.created_at * 1000,
        });

        remainingAllowance -= tipAmount;

        i++;
      }
    }
  }
}

async function pause(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

tipsAgentModeling().catch(console.error);
