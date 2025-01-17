import { prisma } from "@farther/backend";
import {
  DEV_USER_TWITTER_ID,
  EVANGELIST_FOLLOWER_MINIMUM,
  TWEET_BASE_TOKENS,
  TWEET_FARTHER_BONUS_MULTIPLIER,
  WAD_SCALER,
} from "@farther/common";
import { apiSchemas } from "@lib/types/apiSchemas";
import * as Sentry from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { getEvanglistAllocationBonus } from "server/evangelize/getEvangelistAllocation";
import { publicProcedure } from "server/trpc";
import { v4 as uuidv4 } from "uuid";

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw new Error("TWITTER_BEARER_TOKEN not set");
}

const twitterConfig = {
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
};

export const validateTweet = publicProcedure
  .input(apiSchemas.validateTweet.input)
  .mutation(async (opts) => {
    const { tweetId, fid } = opts.input;

    const response = {
      isValid: false,
      reason: "",
      totalReward: 0,
      bonusReward: 0,
      hasFartherBonus: false,
    };

    let tweetAuthorId: string;
    let tweetText: string;

    // Check for exact match in database
    const existingTweet = await prisma.tweet.findFirst({
      where: {
        id: tweetId,
      },
    });

    if (existingTweet) {
      response.reason = "That tweet was already submitted 😉";
      response.isValid = false;
      return response;
    }

    // Get user
    const user = await prisma.user.findFirst({
      where: {
        id: fid,
      },
      include: {
        allocations: {
          where: {
            type: "EVANGELIST",
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `User not found. fid: ${fid}`,
      });
    }

    if (user.allocations.length > 0) {
      response.reason = `Only one tweet submission per user is currently allowed.`;
      response.isValid = false;
      return response;
    }

    try {
      const twitterResponse = await fetch(
        `https://api.twitter.com/2/tweets?ids=${tweetId}&tweet.fields=text,author_id,note_tweet`,
        twitterConfig,
      );

      const data = await twitterResponse.json();

      if (!data.data || !data.data.length) {
        Sentry.captureException(
          new Error(`No data returned for tweet ${tweetId}`),
        );
        response.reason = `Experienced error while retrieving tweet. This may be an issue with Twitter's API. Please try again in a minute.`;
        response.isValid = false;
        return response;
      }

      // For tweets longer than 280 chars, this contains the full text
      const noteTweet = data.data[0].note_tweet;
      tweetText = (noteTweet || {}).text || (data.data[0].text as string);
      tweetAuthorId = data.data[0].author_id as string;
    } catch (error) {
      Sentry.captureException(error);
      response.reason = `Experienced error while retrieving tweet. This may be an issue with Twitter's API. Please try again in a minute.`;
      response.isValid = false;
      return response;
    }

    const { isValid, reason } = verifyTweetText({ tweetText, fid: user.id });
    response.isValid = isValid;
    response.reason = reason || "";
    response.hasFartherBonus = /\$FARTHER/i.test(tweetText);

    if (!isValid) {
      return response;
    }

    let followerCount = 0;

    // Fetch user's follower count
    const twitterResponse = await fetch(
      `https://api.twitter.com/2/users/${tweetAuthorId}?user.fields=public_metrics`,
      twitterConfig,
    );

    const data = await twitterResponse.json();

    followerCount =
      (data &&
        data.data &&
        data.data.public_metrics &&
        (data.data.public_metrics.followers_count as number)) ||
      0;

    if (
      followerCount < EVANGELIST_FOLLOWER_MINIMUM &&
      tweetAuthorId !== DEV_USER_TWITTER_ID
    ) {
      response.reason = `Sorry, your Twitter account must have at least ${EVANGELIST_FOLLOWER_MINIMUM} followers to qualify.`;
      response.isValid = false;
      return response;
    }

    response.bonusReward = getEvanglistAllocationBonus({
      followerCount,
      baseTokensPerTweet: TWEET_BASE_TOKENS,
    });

    response.totalReward = TWEET_BASE_TOKENS + response.bonusReward;

    if (response.hasFartherBonus) {
      response.totalReward = Math.round(
        response.totalReward * TWEET_FARTHER_BONUS_MULTIPLIER,
      );
      response.bonusReward = response.totalReward - TWEET_BASE_TOKENS;
    }

    const totalRewardWad = BigInt(response.totalReward) * WAD_SCALER;

    // Look for existing pending allocation
    const pendingAllocation = await prisma.allocation.findFirst({
      where: {
        userId: user.id,
        type: "EVANGELIST",
        airdropId: null,
        isInvalidated: false,
      },
    });

    if (pendingAllocation) {
      // Create tweet
      await prisma.$transaction(async (tx) => {
        const tweet = await tx.tweet.create({
          data: {
            id: tweetId,
            reward: totalRewardWad.toString(),
            allocationId: pendingAllocation.id,
            authorId: tweetAuthorId,
            followerCount,
          },
        });

        await tx.allocation.update({
          where: {
            id: pendingAllocation.id,
          },
          data: {
            amount: (
              BigInt(pendingAllocation.amount) + totalRewardWad
            ).toString(),
            baseAmount: (BigInt(TWEET_BASE_TOKENS) * WAD_SCALER).toString(),
            tweets: {
              connect: {
                id: tweet.id,
              },
            },
          },
        });
      });
    } else {
      const id = uuidv4();
      // If no pending allcation, create allocation & tweet
      await prisma.allocation.create({
        data: {
          id,
          type: "EVANGELIST",
          amount: totalRewardWad.toString(),
          baseAmount: (BigInt(TWEET_BASE_TOKENS) * WAD_SCALER).toString(),
          tweets: {
            create: {
              id: tweetId,
              reward: totalRewardWad.toString(),
              authorId: tweetAuthorId,
              followerCount,
            },
          },
          user: {
            connect: {
              id: fid,
            },
          },
        },
      });
    }

    return response;
  });

function verifyTweetText({
  tweetText,
  fid,
}: {
  tweetText: string;
  fid: number;
}) {
  const hasFarcaster = /farcaster/i.test(tweetText);
  const fidPattern = new RegExp(`FID${fid}`, "i");
  const hasFID = fidPattern.test(tweetText);

  if (!hasFarcaster) {
    return {
      isValid: false,
      reason: `Tweet is missing "farcaster". Please check it and try again.`,
    };
  }
  if (!hasFID) {
    return {
      isValid: false,
      reason: `Tweet is missing FID<Farcaster ID> or ID is incorrect. Please check it and try again.`,
    };
  }
  return { isValid: true };
}
