import {
  TOTAL_TOKEN_SUPPLY,
  allocationRatios,
  contractAddresses,
} from "@farther/common/src/constants";
import { ROUTES } from "@lib/constants";
import Link from "next/link";
import Head from "next/head";
import numeral from "numeral";
import { ExternalLink } from "@components/ui/ExternalLink";
import { useModal } from "@lib/context/ModalContext";
import { Button } from "@components/ui/Button";
import Image from "next/image";

const EcosystemFundModal = () => (
  <>
    The ecosystem fund is an open-ended pool for funding any future initiative
    that is aligned with the Farcaster & Farther communities. It will initially
    be controlled by the founder, but may eventually be turned over to community
    governance. Some plans for funding include:
    <ul>
      <li>Partnerships with Farcaster apps</li>
      <li>Education resources</li>
      <li>Hackathon sponsorships</li>
      <li>Micro apps</li>
    </ul>
  </>
);

export default function Home() {
  const { openModal } = useModal();

  return (
    <>
      <Head>
        <title>Farther</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="content">
        <div className="w-scren flex h-[calc(100vh-64px)] items-center justify-center">
          {/* <Image
            alt="FARTHER✨"
            src="/images/arches-landing-page-1400.png"
            width={1400}
            height={788}
          /> */}
        </div>
        <h1>Mission</h1>
        <p>
          Farther's mission is to accelerate the global adoption of{" "}
          <ExternalLink href="https://decrypt.co/215856/what-is-farcaster-ethereum-crypto-twitter-alternative">
            Farcaster
          </ExternalLink>{" "}
          and spread positive vibes.
        </p>

        <h2>Why</h2>
        <ul>
          <li>
            Social relationships should be as unmediated online as they are in
            real life.
          </li>
          <li>
            Cultural norms should be as localizable and enforceable online as
            they are offline.
          </li>
          <li>
            Our attention should not be a product sold to advertisers without
            our awareness or consent.
          </li>
        </ul>
        <p>
          Centralized social networks aren't capable of fulfilling those
          requirements. Many new decentralized social protocols are striving for
          the same goals, but Farcaster stands out as achieving them in a way
          that is both credibly neutral and scalable.
        </p>
        <p className="text-muted">
          Visit the <Link href={ROUTES.resources.path}>resources page</Link> to
          learn more about what makes Farcaster unique.
        </p>

        <h2>How</h2>
        <p>
          <ExternalLink
            href={`https://basescan.org/token/${contractAddresses.FARTHER}`}
          >
            FARTHER
          </ExternalLink>{" "}
          is an Ethereum token for driving Farcaster user growth. It is being
          used to incentivize active users and builders within the ecosystem in
          the following ways:
        </p>
        <ul>
          <li>
            <Link href={ROUTES.airdrop.path}>Airdrops</Link> to Farcaster power
            users spanning the next 3 years
          </li>
          <li>
            {" "}
            <Link href={ROUTES.evangelize.path}>Evangelist rewards</Link> for
            expressing love of Farcaster on legacy social apps
          </li>
          <li>
            <Link href={ROUTES.liquidty.path}>Onchain liquidity rewards</Link>
          </li>
          <li>
            <Link href={ROUTES.tips.path}>Tip allocations</Link>
          </li>
          <li>
            <Button
              variant="link"
              onClick={() =>
                openModal({
                  headerText: "Ecosystem fund",
                  body: <EcosystemFundModal />,
                })
              }
            >
              Partnerships & ecosystem fund
            </Button>
          </li>
        </ul>

        <h2>Tokenomics</h2>
        <p>
          The initial supply of FARTHER is{" "}
          {numeral(TOTAL_TOKEN_SUPPLY / 1_000_000_000).format("0,0")} billion
          tokens, and there is no initial price. The community will decide what
          its worth. Please read the{" "}
          <Link href="/disclaimers">disclaimers</Link> before buying.
        </p>
        <p>It is allocated as follows:</p>
        <ul>
          <li>
            {allocationRatios.POWER_DROPS * 100}%{" "}
            <Link href={ROUTES.airdrop.path}>airdrops to power users</Link>
          </li>
          <li>
            {(allocationRatios.LIQUIDITY_REWARDS +
              allocationRatios.LIQUIDITY_BACKSTOP) *
              100}
            %{" "}
            <Link href={ROUTES.liquidty.path}>
              liquidity pool & mining rewards
            </Link>
          </li>
          <li>
            {allocationRatios.EVANGELIST_REWARDS * 100}%{" "}
            <Link href={ROUTES.evangelize.path}>evangelist rewards</Link>
          </li>
          <li>
            {allocationRatios.ECOSYSTEM_FUND * 100}%{" "}
            <Button
              variant="link"
              onClick={() =>
                openModal({
                  headerText: "Ecosystem fund",
                  body: <EcosystemFundModal />,
                })
              }
            >
              ecosystem fund
            </Button>
          </li>
          <li>
            {allocationRatios.TIPS * 100}%{" "}
            <Link href={ROUTES.tips.path}>tip allocations</Link>
          </li>
          <li>
            {allocationRatios.DEV_FUND * 100}%{" "}
            <Button
              variant="link"
              onClick={() =>
                openModal({
                  headerText: "Founder Allocation",
                  body: (
                    <>
                      {allocationRatios.DEV_FUND * 100}% of the FARTHER supply
                      is reserved for the founding team. After launch, it will
                      be put in a vesting contract that unlocks 25% after a year
                      and continually unlocks the remaining 75% over two years.
                    </>
                  ),
                })
              }
            >
              founder allocation
            </Button>
          </li>
        </ul>
        <p>
          In addition to the initial supply, the{" "}
          <ExternalLink
            href={`https://basescan.org/token/${contractAddresses.FARTHER}#code`}
          >
            Farther token contract
          </ExternalLink>{" "}
          is capable of optionally minting up to 2% of the current token supply
          per year. This could potentially be used to fund future initiatives,
          however there are currently no specific plans for it. It can be
          permanently revoked if the Farther community decides.
        </p>
      </main>
    </>
  );
}
