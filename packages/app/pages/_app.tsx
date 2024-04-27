require("dotenv").config();

import "@styles/globals.css";
import { GlobalModal } from "@components/modals/GlobalModal";
import { SiteHeader } from "@components/nav/SiteHeader";
import { Footer } from "@components/nav/Footer";
import { Toaster } from "@components/ui/Toaster";
import { MediaQueryProvider } from "@lib/context/MediaQueryContext";
import { ModalProvider } from "@lib/context/ModalContext";
import { ThemeProvider } from "@lib/context/ThemeProvider";
import { trpcClient } from "@lib/trpcClient";
import type { AppProps } from "next/app";
import React from "react";
import { UserProvider } from "@lib/context/UserContext";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { wagmiConfig } from "@lib/walletConfig";
import ComingSoon from "@components/ComingSoon";
import { isProduction } from "@farther/common";
import { Container } from "@components/ui/Container";
import { StarLoop } from "@components/StarLoop";
import Head from "next/head";

// Setup queryClient
const queryClient = new QueryClient();

const App = ({ Component, pageProps }: AppProps) => {
  const [pw, setPw] = React.useState<string>("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setPw(localStorage.getItem("pw") || "");
    }
  }, [setPw]);

  /**
   * Forces dark mode
   */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const isLightMode = document
      .getElementsByTagName("html")[0]
      .classList.contains("light");

    if (isLightMode) {
      document.getElementsByTagName("html")[0].classList.remove("light");
      document.getElementsByTagName("html")[0].classList.add("dark");
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="color-scheme" content="dark only"></meta>
      </Head>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <UserProvider>
              <MediaQueryProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                >
                  <StarLoop />
                  {isProduction && pw !== "letmein" ? (
                    <ComingSoon>
                      <h2 className="border-none pl-0">Coming Soon</h2>
                    </ComingSoon>
                  ) : (
                    <ModalProvider>
                      <Toaster />
                      <SiteHeader />
                      <GlobalModal />
                      <Container variant="page">
                        <Component {...pageProps} />
                      </Container>
                      <Footer />
                    </ModalProvider>
                  )}
                </ThemeProvider>
              </MediaQueryProvider>
            </UserProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
};

export default trpcClient.withTRPC(App);
