import fetch from "node-fetch";
import { neynarLimiter } from "@common/neynar";
import {
  TEST_USER_ADDRESS,
  TEST_USER_FID,
  WARPCAST_API_BASE_URL,
} from "@common/constants";
import { prisma } from "@backend/prisma";
import { adminProcedure } from "server/trpc";
import { dbLimiter } from "../../lib/utils";
import { TRPCError } from "@trpc/server";
import { ENVIRONMENT, isProduction } from "@common/env";

// Updates power users in the database who have recently connected an address
async function updateConnectedAddresses() {
  console.log("Updating power users");

  // Fetch power users from DB without connected wallet address
  const users = await prisma.user.findMany({
    where: {
      address: null,
      isPowerUser: true,
    },
  });

  console.log("Pending recipients:", users.length);

  // Check Neynar to see if ^those users have connected wallet since last check
  const fids = users.map((u) => u.fid);
  const usersWithConnectedAddress = (await neynarLimiter.getUsers(fids)).filter(
    (u) => u.verified_addresses.eth_addresses.length > 0,
  );

  console.log(
    "Pending power users who recently connected wallet:",
    usersWithConnectedAddress.length,
  );

  if (usersWithConnectedAddress.length === 0) {
    return;
  }

  // Update database
  await prisma.$transaction(
    usersWithConnectedAddress.map((u) => {
      return prisma.user.update({
        where: { fid: u.fid },
        data: { address: u.verified_addresses.eth_addresses[0] },
      });
    }),
  );

  console.log(
    `Updated database with power users who have connected addresses. Fids: ${usersWithConnectedAddress.map((u) => u.fid)}`,
  );
}

// Fetches power users from warpcast, gets their data from Neynar, and upserts them in the DB
async function prepareNewPowerUsers() {
  console.log("Preparing new power users");
  // Fetch all power users Warpcast API.

  const warpcastResponse = (await (
    await fetch(`${WARPCAST_API_BASE_URL}power-badge-users`)
  ).json()) as { result: { fids: number[] } };

  // Only include Dan & Varun in dev so the Merkle root is the same every time
  const powerUserFids =
    ENVIRONMENT === "development" ? [2, 3] : warpcastResponse.result.fids;

  console.log("Warpcast power users:", powerUserFids.length);

  // Get data from Neynar
  const users = await neynarLimiter.getUsers(powerUserFids);

  const time = new Date().getTime();
  console.log("Users from Neynar:", users.length);

  // Upsert User records
  await Promise.all(
    users.map((u) => {
      const data = {
        fid: u.fid,
        address: u.verified_addresses.eth_addresses.length
          ? u.verified_addresses.eth_addresses[0].toLowerCase()
          : null,
        isPowerUser: true,
      };
      return dbLimiter.schedule(() =>
        prisma.user.upsert({
          where: { fid: u.fid },
          create: data,
          update: data,
        }),
      );
    }),
  );

  // For testing
  if (!isProduction) {
    const data = {
      fid: TEST_USER_FID,
      address: TEST_USER_ADDRESS.toLowerCase(),
      isPowerUser: true,
    };
    await prisma.user.upsert({
      where: { fid: TEST_USER_FID },
      create: data,
      update: data,
    });
  }

  console.log(
    `Upserted new power users in ${(new Date().getTime() - time) / 1000}s`,
  );
}

// This is called via a cron job in prod
export const updatePowerUsers = adminProcedure.query(
  async ({ ctx: { res } }) => {
    try {
      await updateConnectedAddresses();
      await prepareNewPowerUsers();
      console.log("done");
      res.status(200).send({ success: true });
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: error.status || "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }
  },
);
