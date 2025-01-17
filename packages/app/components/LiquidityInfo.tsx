import { InfoCard } from "@components/InfoCard";
import { BonusRewardsModal } from "@components/modals/BonusRewardsModal";
import { FartherAccountLink } from "@components/nav/FartherLinks";
import { Button } from "@components/ui/Button";
import { ExternalLink } from "@components/ui/ExternalLink";
import {
  LIQUIDITY_BONUS_MULTIPLIER,
  NETWORK,
  allocationRatios,
  contractAddresses,
} from "@farther/common";
import { clickIds } from "@lib/constants";
import { useModal } from "@lib/context/ModalContext";
import { useUser } from "@lib/context/UserContext";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function LiquidityInfo() {
  const { account } = useUser();
  const { openModal } = useModal();
  const { openConnectModal } = useConnectModal();

  return (
    <div className="content">
      <h1>Liquidity Rewards</h1>
      <p>
        {allocationRatios.LIQUIDITY_REWARDS * 100}% of the total token supply is
        allocated to liquidity rewards. The first rewards program is for the
        Uniswap V3 ETH-FARTHER (0.3%) pool on Base, which began May 1, 2024. It
        lasts for six months.
      </p>
      <InfoCard variant="attention">
        Liquidity providers who have a Warpcast power badge currently get a
        <strong> {LIQUIDITY_BONUS_MULTIPLIER}x bonus </strong>for their claimed
        rewards airdropped at the end of the month!{"  "}
        <Button
          sentryId={clickIds.liquidityInfoBonusRewards}
          onClick={() =>
            openModal({
              headerText: "Liquidity Bonus Rewards",
              body: <BonusRewardsModal />,
            })
          }
          variant="link"
        >
          Learn more✨
        </Button>
      </InfoCard>
      <h2>How to participate</h2>
      <ol>
        <li>
          <p>
            <strong>Please read before you begin:</strong>
          </p>
          <ul>
            <li>
              If you haven't yet, please read the{" "}
              <Link href="/disclaimers">disclaimers</Link>
            </li>
            <li>
              If this is your first time providing liquidity in a decentralized
              exchange, please consider the risks of{" "}
              <ExternalLink href="https://support.uniswap.org/hc/en-us/articles/20904453751693-What-is-Impermanent-Loss">
                impermanent loss
              </ExternalLink>
              .
            </li>
            <li>
              This rewards program is using the official{" "}
              <ExternalLink href="https://github.com/Uniswap/v3-staker">
                Uniswap V3 Staker contract
              </ExternalLink>
              . There is no public audit available, however it was developed by
              Uniswap. Use at your own risk.
            </li>
            <li>
              You only accrue Farther rewards while the price is within the
              range of liquidity of your position. If you notice rewards have
              stopped accruing, it is likely because the price has moved outside
              of your position's range. You can check by clicking the position
              ID which will link you directly to the position on Uniswap.
            </li>
            <li>
              Rewards are distributed using the same logic as Uniswap fees.
              Narrower ranges earn more rewards.
            </li>
          </ul>
        </li>
        {!account.address && (
          <li>
            <Button
              sentryId={clickIds.liqInfoConnect}
              variant="link"
              onClick={openConnectModal}
            >
              Connect your wallet
            </Button>
          </li>
        )}
        <li>
          Add a liquidity position to the 0.3% fee{" "}
          <ExternalLink
            href={`https://app.uniswap.org/add/ETH/${contractAddresses.FARTHER}/3000?chain=${NETWORK}`}
          >
            pool on Uniswap
          </ExternalLink>{" "}
          (
          <strong>
            It <em>must</em> be the 0.3% pool!
          </strong>
          ).
        </li>
        <li>
          Return to this page. After a moment, refresh the page and your
          position should be displayed.
        </li>
        <li>
          Click <em>Stake</em> to initiate a transaction that locks your LP
          token. At this point, you will start accruing rewards.
        </li>
        <li>
          Claiming your rewards is a two-step process. First click{" "}
          <em>Unstake</em>, which makes your rewards claimable. Then click{" "}
          <em>Claim</em>.{" "}
        </li>
      </ol>
      <p>
        Please <FartherAccountLink>reach out</FartherAccountLink> if you have
        any questions or problems.
      </p>
    </div>
  );
}
