"use client";

import { GithubIcon, Link02Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";

import { api } from "@/../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { safeExternalUrl } from "@/lib/safe-external-url";
import { cn } from "@/lib/utils";

function providerLabel(provider: string) {
  return provider
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function GitHubProfileCard() {
  const auth = useConvexAuth();
  const profile = useQuery(
    api.functions.site.users.getMyCreatorProfile,
    auth.isAuthenticated ? {} : "skip",
  );

  if (auth.isLoading || profile === undefined) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  const githubUrl = profile.githubUsername
    ? `https://github.com/${encodeURIComponent(profile.githubUsername)}`
    : undefined;
  const websiteUrl = safeExternalUrl(profile.websiteUrl);

  return (
    <div>
      <h2 className="mb-3 font-semibold text-sm">GitHub profile</h2>
      <Card className="shadow-none">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage alt={profile.displayName} src={profile.avatarUrl} />
              <AvatarFallback>{profile.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold text-base">{profile.displayName}</p>
              {profile.githubUsername ? (
                <p className="truncate text-muted-foreground text-sm">@{profile.githubUsername}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="font-medium text-sm">Bio</p>
              <p className="mt-1 text-muted-foreground text-sm leading-6">
                {profile.bio ?? "No public GitHub bio."}
              </p>
            </div>
            <div>
              <p className="font-medium text-sm">Location</p>
              <p className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
                <HugeiconsIcon className="size-4" icon={Location01Icon} />
                {profile.location ?? "Not provided"}
              </p>
            </div>
            <div>
              <p className="font-medium text-sm">Website</p>
              {websiteUrl ? (
                <a
                  className="mt-1 flex items-center gap-2 truncate text-primary text-sm hover:underline"
                  href={websiteUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <HugeiconsIcon className="size-4 shrink-0" icon={Link02Icon} />
                  <span className="truncate">{profile.websiteUrl}</span>
                </a>
              ) : (
                <p className="mt-1 text-muted-foreground text-sm">Not provided</p>
              )}
            </div>
          </div>

          {profile.socialAccounts && profile.socialAccounts.length > 0 ? (
            <div className="border-t pt-5">
              <p className="mb-3 font-medium text-sm">Social accounts</p>
              <div className="flex flex-wrap gap-2">
                {profile.socialAccounts.map((account) => {
                  const url = safeExternalUrl(account.url);
                  return url ? (
                    <a
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                      href={url}
                      key={`${account.provider}-${account.url}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <HugeiconsIcon className="size-4" icon={Link02Icon} />
                      {providerLabel(account.provider)}
                    </a>
                  ) : null;
                })}
              </div>
            </div>
          ) : null}

          <p className="rounded-lg border bg-muted p-3 text-muted-foreground text-xs leading-5">
            Profile details are read-only on BedrockNexus and refresh from GitHub when you sign in.
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <a
            className={cn(buttonVariants({ size: "sm" }))}
            href="https://github.com/settings/profile"
            rel="noreferrer"
            target="_blank"
          >
            <HugeiconsIcon className="size-4" icon={GithubIcon} />
            Edit on GitHub
          </a>
          {githubUrl ? (
            <a
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              href={githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              View GitHub profile
            </a>
          ) : null}
          {profile.username || profile.slug ? (
            <Link
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              href={`/creators/${profile.username ?? profile.slug}`}
            >
              View public profile
            </Link>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
