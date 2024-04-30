import { AllocationType } from "@farther/backend";

export const ROUTES = {
  rewards: {
    title: "Rewards",
    path: "/rewards",
    type: "user",
  },
  airdrop: {
    title: "Airdrops",
    path: "/airdrops",
    type: "user",
  },
  evangelize: {
    title: "Evangelize",
    path: "/evangelize",
    type: "user",
  },
  liquidty: {
    title: "Liquidity",
    path: "/liquidity",
    type: "user",
  },
  tips: {
    title: "Tips",
    path: "/tips",
    type: "user",
  },
  tokenomics: {
    title: "Tokenomics",
    path: "/tokenomics",
    type: "info",
  },
  resources: {
    title: "Resources",
    path: "/resources",
    type: "info",
  },
} as const;

export const FARTHER_CHANNEL_URL = "https://warpcast.com/~/channel/farther";

export const POWER_BADGE_INFO_URL = "https://warpcast.com/v/0x0bd49f9c";

export const claimNames = {
  [AllocationType.POWER_USER]: "Power User",
  [AllocationType.EVANGELIST]: "Evangelist",
};

export const PENDING_ALLOCATION_ID = "id-for-pending-allocation";

export const ROOT_ENDPOINTS = {
  production: "https://farther.social",
  staging: "https://staging.farther.social",
  development: "http://localhost:3000",
} as const;

export const ROOT_ENDPOINT =
  ROOT_ENDPOINTS[
    process.env.NEXT_PUBLIC_ENV as "production" | "staging" | "development"
  ];
