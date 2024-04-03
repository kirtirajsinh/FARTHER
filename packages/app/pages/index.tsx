import { AirdropInfo } from "@components/AirdropInfo";
import { LiquidityInfo } from "@components/LiquidityInfo";
import { ROUTES } from "@lib/constants";
import { useUser } from "@lib/context/UserContext";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  const { account } = useUser();
  return (
    <>
      <Head>
        <title>Farther</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container">
        <AirdropInfo />
        <hr className="my-20" />
        <LiquidityInfo />
        {!account.isConnected && (
          <p className={"mt-12"}>
            If you would like to participate, connect your wallet and visit the{" "}
            <Link href={ROUTES.liquidty.path}>liquidity</Link> page.
          </p>
        )}
        <hr className="my-20" />
      </main>
    </>
  );
}
