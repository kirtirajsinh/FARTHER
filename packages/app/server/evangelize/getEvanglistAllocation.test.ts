import { getEvanglistAllocationBonus } from "./getEvangelistAllocation";

describe("getEvangelistAllocation", () => {
  const allocation = getEvanglistAllocationBonus({ followerCount: 100 });

  // assert(
  //   allocation === 100n,
  //   "Allocation for 100 followers should be 100 tokens",
  // );
});
