"use client";

import { authQueryKeys } from "@better-auth-ui/core";
import { useAuth, useAuthPlugin, useDeleteUser, useListAccounts } from "@better-auth-ui/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { type SyntheticEvent, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { deleteUserPlugin } from "@/lib/delete-user-plugin";
import { cn } from "@/lib/utils";

export type DeleteAccountProps = {
  className?: string;
};

export function DeleteAccount({ className }: DeleteAccountProps) {
  const { authClient, basePaths, localization, viewPaths, navigate } = useAuth();
  const { localization: deleteUserLocalization, sendDeleteAccountVerification } =
    useAuthPlugin(deleteUserPlugin);
  const { data: accounts } = useListAccounts(authClient);
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");

  const hasCredentialAccount = accounts?.some((account) => account.providerId === "credential");
  const needsPassword = !sendDeleteAccountVerification && hasCredentialAccount;
  const { mutate: deleteUser, isPending } = useDeleteUser(authClient);

  const handleDialogOpenChange = (open: boolean) => {
    setConfirmOpen(open);
    setPassword("");
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    deleteUser(needsPassword ? { password } : {}, {
      onSuccess: () => {
        setConfirmOpen(false);
        setPassword("");

        if (sendDeleteAccountVerification) {
          toast.success(deleteUserLocalization.deleteUserVerificationSent);
          return;
        }

        toast.success(deleteUserLocalization.deleteUserSuccess);
        queryClient.removeQueries({ queryKey: authQueryKeys.all });
        navigate({
          to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
          replace: true,
        });
      },
    });
  };

  return (
    <Card className={cn("border-destructive shadow-none", className)}>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-sm leading-tight">
            {deleteUserLocalization.deleteAccount}
          </p>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {deleteUserLocalization.deleteAccountDescription}
          </p>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={handleDialogOpenChange}>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" size="sm" disabled={!accounts}>
                {deleteUserLocalization.deleteAccount}
              </Button>
            }
          />

          <AlertDialogContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                  <HugeiconsIcon icon={Alert02Icon} />
                </AlertDialogMedia>
                <AlertDialogTitle>{deleteUserLocalization.deleteAccount}</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteUserLocalization.deleteAccountDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>

              {needsPassword ? (
                <Field>
                  <Label htmlFor="delete-password">{localization.auth.password}</Label>
                  <Input
                    id="delete-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder={localization.auth.passwordPlaceholder}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isPending}
                    required
                  />
                  <FieldError />
                </Field>
              ) : null}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  {localization.settings.cancel}
                </AlertDialogCancel>
                <Button type="submit" variant="destructive" disabled={isPending}>
                  {isPending ? <Spinner /> : null}
                  {deleteUserLocalization.deleteAccount}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
