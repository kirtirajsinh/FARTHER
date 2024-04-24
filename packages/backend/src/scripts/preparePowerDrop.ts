import {
  ANVIL_AIRDROP_ADDRESS,
  DEV_USER_FID,
  WAD_SCALER,
  WARPCAST_API_BASE_URL,
  isProduction,
  neynarLimiter,
  powerUserAirdropConfig,
  tokenAllocations,
} from "@farther/common";
import { AllocationType, prisma } from "../prisma";
import { getMerkleRoot } from "@farther/common";
import { writeFile } from "../utils/helpers";
import { ENVIRONMENT, CHAIN_ID } from "@farther/common";
import { allocateTokens } from "../utils/allocateTokens";

async function preparePowerDrop() {
  // 1. Get power users from Warpcast
  const warpcastResponse = (await (
    await fetch(`${WARPCAST_API_BASE_URL}power-badge-users`)
  ).json()) as { result: { fids: number[] } };

  const powerUserFids = warpcastResponse.result.fids;

  // 2. Get user data from Neynar
  const latestUserData = await neynarLimiter.getUsersByFid(
    warpcastResponse.result.fids,
  );

  // 2. Filter the ones who have a power badge & verified address
  const data = latestUserData
    .filter((u) => !!u.power_badge && !!u.verified_addresses.eth_addresses[0])
    .map((u) => ({
      fid: u.fid,
      address: u.verified_addresses.eth_addresses[0].toLowerCase(),
    }));

  // 3. Upsert users in db
  await prisma.$transaction([
    prisma.user.deleteMany({
      where: {
        fid: {
          in: data.map((u) => u.fid),
        },
      },
    }),
    prisma.user.createMany({
      // Only need fid
      data: data.map((u) => ({ fid: u.fid })),
    }),
  ]);

  // 4. Get all powers users who have not received an airdrop allocation
  const recipients = await prisma.user.findMany({
    where: {
      fid: {
        in: powerUserFids,
      },
      allocations: {
        // Each user only gets one power user airdrop
        none: {
          type: AllocationType.POWER_USER,
        },
      },
    },
    select: {
      id: true,
      fid: true,
    },
  });

  const totalAllocation =
    powerUserAirdropConfig.RATIO * tokenAllocations.powerUserAirdrops;

  // One half == equally distributed. Other half == bonus based on follower count.
  const halfOfTotalWad = (BigInt(totalAllocation) * WAD_SCALER) / BigInt(2);

  const basePerRecipientWad = halfOfTotalWad / BigInt(recipients.length);

  const followerCounts = recipients.map((u) => {
    const followers = latestUserData.find(
      (user) => user.fid === u.fid,
    )?.follower_count;
    return {
      fid: u.fid,
      followers,
    };
  });

  // Add test user (pretending this user is on Farcaster)
  if (!isProduction) {
    followerCounts.push({
      fid: DEV_USER_FID,
      followers: 3993,
    });
  }

  const bonusAllocations = allocateTokens(
    followerCounts.map((u) => ({ fid: u.fid, followers: u.followers })),
    // Need to scale back down to decimal for this function
    Number(halfOfTotalWad / WAD_SCALER),
  );

  const recipientsWithAllocations = recipients.map((r, i) => {
    const address = latestUserData.find((u) => u.fid === r.fid)
      ?.verified_addresses.eth_addresses[0];
    return {
      ...r,
      amount:
        basePerRecipientWad +
        BigInt(bonusAllocations[i].allocation) * WAD_SCALER,
      address: address ? address.toLowerCase() : undefined,
    };
  });

  const recipientsWithoutAddress = recipientsWithAllocations.filter(
    (r) => !r.address,
  );
  if (recipientsWithoutAddress.length > 0) {
    await writeFile(
      `airdrops/${ENVIRONMENT}/${AllocationType.POWER_USER}-${powerUserAirdropConfig.NUMBER}-null-addresses.json`,
      JSON.stringify(
        recipientsWithoutAddress.map((r) => ({
          fid: r.fid,
          allocation: r.amount.toString(),
        })),
        null,
        2,
      ),
    );
  }

  const recipientsWithAddress = recipientsWithAllocations.filter(
    (r) => r.address,
  );

  // Throws away any remainder from the division
  const allocationSum = recipientsWithAddress.reduce(
    (sum, r) => sum + r.amount,
    BigInt(0),
  );

  // Create a merkle tree with the above recipients
  const rawLeafData = recipientsWithAddress.map((r, i) => ({
    index: i,
    address: r.address.toLowerCase() as `0x${string}`,
    amount: r.amount.toString(), // Amount is not needed in the merkle proof
  }));

  const root = getMerkleRoot(rawLeafData);

  const airdropData = {
    number: powerUserAirdropConfig.NUMBER,
    chainId: CHAIN_ID,
    amount: allocationSum.toString(),
    root,
    address: undefined,
  };

  // Upsert Airdrop
  const airdrop = await prisma.airdrop.upsert({
    where: { number: powerUserAirdropConfig.NUMBER, chainId: CHAIN_ID },
    create: airdropData,
    update: airdropData,
  });

  // Add allocations to db
  await prisma.$transaction([
    prisma.allocation.deleteMany({
      where: {
        airdropId: airdrop.id,
      },
    }),
    prisma.allocation.createMany({
      data: recipientsWithAddress.map((r, i) => ({
        amount: r.amount.toString(),
        index: i,
        airdropId: airdrop.id,
        userId: r.id,
        type: AllocationType.POWER_USER,
        address: r.address.toLowerCase(),
      })),
    }),
  ]);

  await writeFile(
    `airdrops/${ENVIRONMENT}/${AllocationType.POWER_USER}-${powerUserAirdropConfig.NUMBER}.json`,
    JSON.stringify(
      {
        root,
        amount: allocationSum.toString(),
        rawLeafData,
      },
      null,
      2,
    ),
  );

  const sortedAllocations = recipientsWithAllocations
    .map((r) => Number(r.amount / WAD_SCALER))
    .sort((a, b) => a - b);

  console.log(sortedAllocations);

  console.log({
    root,
    amount: allocationSum,
    minUserAllocation: sortedAllocations[0],
    maxUserAllocation: sortedAllocations[sortedAllocations.length - 1],
  });

  console.warn(
    `\n\nFOLLOW NEXT STEPS IN RUNBOOK!: \n https://www.notion.so/Airdrop-runbook-ad7d4c7116444d35ab76705eca2d6c98\n\n`,
  );
}

preparePowerDrop().catch(console.error);
