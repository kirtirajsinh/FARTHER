import { EvangelistRules } from "@components/EvangelistRules";
import { Button } from "@components/ui/Button";
import { ExternalLink } from "@components/ui/ExternalLink";
import { Form, FormField, FormItem, FormMessage } from "@components/ui/Form";
import { Input } from "@components/ui/Input";
import { Label } from "@components/ui/Label";
import { POWER_BADGE_INFO_URL, ROUTES, clickIds } from "@lib/constants";
import { useModal } from "@lib/context/ModalContext";
import { useUser } from "@lib/context/UserContext";
import { trpcClient } from "@lib/trpcClient";
import { extractTweetId } from "@lib/utils";
import { useLogError } from "hooks/useLogError";
import { useToast } from "hooks/useToast";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const PAUSED = false;

const FormSchema = z.object({
  tweetUrl: z.string(),
});

type FormData = z.infer<typeof FormSchema>;

export function SubmitTweet() {
  const { closeModal } = useModal();
  const { toast } = useToast();
  const { user, userIsLoading, refetchUser, account } = useUser();
  const logError = useLogError();
  const form = useForm<FormData>({
    defaultValues: {
      tweetUrl: "",
    },
  });
  const validateTweetMutation = trpcClient.validateTweet.useMutation();

  const submitTweetUrl = async (data: FormData) => {
    if (!user) return;

    const tweetId = extractTweetId(data.tweetUrl);

    if (!tweetId) {
      toast({
        msg: "Invalid tweet URL. Please check it and try again.",
      });
      return;
    }

    try {
      const mutationResponse = await validateTweetMutation.mutateAsync({
        tweetId,
        fid: user.fid,
      });

      if (!mutationResponse.isValid) {
        toast({ msg: mutationResponse.reason });
      } else {
        closeModal();
        refetchUser();
        toast({
          msg: (
            <>
              {mutationResponse.bonusReward ? (
                <>
                  Congrats! Your tweet earned you {mutationResponse.totalReward}{" "}
                  FARTHER (including a bonus of {mutationResponse.bonusReward}).
                  It will become claimable on your{" "}
                  <Link href={ROUTES.profile.path}>profile page</Link> at the
                  end of the month.
                </>
              ) : (
                <>
                  Success! You just earned {mutationResponse.totalReward}{" "}
                  FARTHER points. You have two months to earn a{" "}
                  <ExternalLink href={POWER_BADGE_INFO_URL}>
                    Warpcast power badge
                  </ExternalLink>{" "}
                  for them to be claimable as tokens. Watch your{" "}
                  <Link href={ROUTES.profile.path}>profile page</Link> page.
                </>
              )}
            </>
          ),
        });
      }
    } catch (error) {
      logError({ error, capture: true, showGenericToast: true });
    }
  };

  React.useEffect(() => {
    if (validateTweetMutation.error?.data?.zodError) {
      logError({
        error: JSON.stringify(
          validateTweetMutation.error?.data?.zodError,
          null,
          2,
        ),
        showGenericToast: true,
      });
      return;
    }

    const error = validateTweetMutation.error?.shape;

    const showGenericToast = !!(error && error.data.code !== "BAD_REQUEST");

    logError({
      error: validateTweetMutation.error,
      showGenericToast,
      toastMsg: error?.message,
    });
  }, [validateTweetMutation.error, logError]);

  return (
    <div>
      <EvangelistRules />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitTweetUrl)}>
          <FormField
            control={form.control}
            name="tweetUrl"
            render={({ field }) => (
              <FormItem>
                <Label className="mb-1 mt-8 block" htmlFor="tweetUrl">
                  Tweet URL
                </Label>
                <Input placeholder="https://twitter.com/..." {...field} />
              </FormItem>
            )}
          />
          <Button
            sentryId={clickIds.submitTweet}
            loadingText="Validating"
            className="mt-4"
            type="submit"
            disabled={PAUSED || !user}
            loading={validateTweetMutation.isPending}
          >
            Submit
          </Button>
          {PAUSED ? (
            <FormMessage>
              Evangelist rewards are currently paused while this month's
              airdrops are prepared. Please check back later.
            </FormMessage>
          ) : !account.address ? (
            <FormMessage>Please connect your wallet to submit</FormMessage>
          ) : (
            !user &&
            !userIsLoading && (
              <FormMessage className="text-destructive">
                No Farcaster user found associated with your address
              </FormMessage>
            )
          )}
        </form>
      </Form>
    </div>
  );
}
