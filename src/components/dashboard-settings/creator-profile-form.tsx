"use client";

import { GithubIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { api } from "@/../convex/_generated/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The public creator profile could not be saved.";
}

export function CreatorProfileForm() {
  const auth = useConvexAuth();
  const profile = useQuery(
    api.functions.site.users.getMyCreatorProfile,
    auth.isAuthenticated ? {} : "skip",
  );
  const updateProfile = useMutation(api.functions.site.users.updateMyCreatorProfile);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (auth.isLoading || profile === undefined) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const username = String(formData.get("username") ?? "")
        .trim()
        .toLowerCase();
      const bio = String(formData.get("bio") ?? "").trim();
      const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
      await updateProfile({
        username,
        bio: bio || undefined,
        websiteUrl: websiteUrl || undefined,
      });
      toast.success("Public creator profile saved.");
    } catch (error) {
      const message = errorMessage(error);
      setFormError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h2 className="mb-3 font-semibold text-sm">Public creator profile</h2>
      <form key={profile.updatedAt} onSubmit={handleSubmit}>
        <Card className="shadow-none">
          <CardContent className="space-y-6">
            <Field>
              <Label htmlFor="creator-username">Username</Label>
              <Input
                autoCapitalize="none"
                autoComplete="username"
                defaultValue={profile.username ?? profile.slug ?? ""}
                disabled={pending}
                id="creator-username"
                maxLength={39}
                minLength={1}
                name="username"
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                placeholder={profile.githubUsername ?? "creator-name"}
                required
                spellCheck={false}
              />
              <FieldDescription>
                Your BedrockNexus handle and public URL: bedrocknexus.com/creators/username
              </FieldDescription>
            </Field>
            <Field>
              <Label htmlFor="creator-bio">Bio</Label>
              <Textarea
                defaultValue={profile.bio ?? ""}
                disabled={pending}
                id="creator-bio"
                maxLength={1_000}
                name="bio"
                placeholder="Tell plugin users what you build and maintain."
                rows={6}
              />
              <FieldDescription>Shown on your public BedrockNexus creator page.</FieldDescription>
            </Field>
            <Field>
              <Label htmlFor="creator-website">Website</Label>
              <Input
                defaultValue={profile.websiteUrl ?? ""}
                disabled={pending}
                id="creator-website"
                maxLength={500}
                name="websiteUrl"
                placeholder="https://example.com"
                type="url"
              />
            </Field>
            {formError ? <FieldError>{formError}</FieldError> : null}
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3">
            <Button disabled={pending} size="sm" type="submit">
              {pending ? <Spinner /> : null}
              Save public profile
            </Button>
            <div className="flex flex-wrap gap-2">
              {profile.githubUsername ? (
                <a
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                  href={`https://github.com/${encodeURIComponent(profile.githubUsername)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <HugeiconsIcon className="size-4" icon={GithubIcon} />@{profile.githubUsername} on
                  GitHub
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
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
