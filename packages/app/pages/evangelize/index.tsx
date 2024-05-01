import { EvangelistRules } from "@components/EvangelistRules";
import { NoUserFoundCard } from "@components/NoUserFoundCard";
import { SubmitTweet } from "@components/SubmitTweet";
import { Button } from "@components/ui/Button";
import { Container } from "@components/ui/Container";
import { ExternalLink } from "@components/ui/ExternalLink";
import { BASE_TOKENS_PER_TWEET } from "@farther/common";
import { ROUTES, clickIds } from "@lib/constants";
import { useModal } from "@lib/context/ModalContext";
import { useUser } from "@lib/context/UserContext";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useToast } from "hooks/useToast";
import Link from "next/link";
import numeral from "numeral";

export default function EvangelizePage() {
  const { openModal } = useModal();
  const { account, user, userIsLoading } = useUser();
  const { openConnectModal } = useConnectModal();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!account.address && !!openConnectModal) {
      toast({
        msg: (
          <>
            Please{" "}
            <Button
              id={clickIds.evangelizePageConnectWallet}
              variant="link"
              onClick={openConnectModal}
            >
              connect your wallet
            </Button>{" "}
            before submitting a tweet
          </>
        ),
      });
    } else {
      openModal({
        header: "Submit Tweet",
        body: <SubmitTweet />,
      });
    }
  };

  const isNotOnFarcaster = account.address && !user && !userIsLoading;

  const DEFAULT_TWEET_LINK = `https://twitter.com/intent/tweet?text=Farcaster%20is%20pushing%20social%20media%20farther%E2%9C%A8%0A%0AFID${user?.fid}`;

  return (
    <Container variant="page">
      <div className="content">
        <h1>Evangelize</h1>
        {isNotOnFarcaster && <NoUserFoundCard />}
        <p>
          Farcaster users can earn Farther tokens by evangelizing Farcaster on
          legacy social media platforms. The rewards scale based on the number
          of followers of the evangelizing account. Currently only X (Twitter)
          is supported but more will follow.
        </p>
        <p>
          The current base reward is{" "}
          {numeral(BASE_TOKENS_PER_TWEET).format("0,0")} tokens per valid tweet.
          This amount is likely to change in future months based on
          participation. An additional bonus is applied based on your Twitter
          follower count.
        </p>
        <h2>Steps</h2>
        <ol>
          {!account.address && (
            <li>
              <Button
                id={clickIds.evangelizePageConnectWallet}
                variant="link"
                onClick={openConnectModal}
              >
                Connect your wallet
              </Button>{" "}
            </li>
          )}
          <li>
            {user?.fid ? (
              <ExternalLink href={DEFAULT_TWEET_LINK}>
                Post a tweet
              </ExternalLink>
            ) : (
              "Post a tweet"
            )}{" "}
            that includes:{" "}
            <ul>
              <li>"Farcaster"</li>
              <li>
                "FID
                {user?.fid ?? "<Farcaster ID>"}"{" "}
                {user?.fid && "(This is your unique Farcaster ID)"}
              </li>
            </ul>
          </li>
          <li>
            Copy the tweet's URL and{" "}
            <Link href={`${ROUTES.evangelize.path}/submit-tweet`}>
              submit it here
            </Link>
            .
          </li>
          <li>
            If you meet all the conditions below, your reward points will become
            redeemable as Farther tokens on the{" "}
            <Link href={ROUTES.rewards.path}>rewards page</Link> at the end of
            the month.
          </li>
        </ol>

        <h2>Conditions</h2>
        <EvangelistRules />
      </div>
    </Container>
  );
}

export function getStaticProps() {
  return {
    props: {
      seo: {
        title: "Evangelize",
      },
    },
  };
}