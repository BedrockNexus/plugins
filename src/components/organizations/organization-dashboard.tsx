"use client";

import {
  Building03Icon,
  Delete02Icon,
  GithubIcon,
  Package01Icon,
  UserAdd01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type OrganizationRole = "owner" | "admin" | "member";

type FullOrganization = {
  id: string;
  name: string;
  slug: string;
  members: Array<{
    id: string;
    role: string;
    user: {
      name: string;
      email: string;
    };
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role?: string | null;
    status: string;
  }>;
};

type UserInvitation = {
  id: string;
  email: string;
  role?: string | null;
  status: string;
  organizationId: string;
  organizationName: string;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export function OrganizationsDashboard() {
  const router = useRouter();
  const organizations = authClient.useListOrganizations();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [invitationBusy, setInvitationBusy] = useState<string | null>(null);

  const loadInvitations = useCallback(async () => {
    const result = await authClient.organization.listUserInvitations();
    if (!result.error) {
      setInvitations(
        (result.data ?? [])
          .filter((invitation) => invitation.status === "pending")
          .map((invitation) => ({
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            organizationId: invitation.organizationId,
            organizationName: invitation.organizationName,
          })),
      );
    }
  }, []);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    try {
      const result = await authClient.organization.create({ name: name.trim(), slug });
      if (result.error) {
        throw new Error(result.error.message);
      }
      if (!result.data) {
        throw new Error("Better Auth did not return the new organization.");
      }

      await authClient.organization.setActive({ organizationId: result.data.id });
      toast.success(`${result.data.name} is ready.`);
      router.push(`/dashboard/organizations/${result.data.slug}` as Route);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setCreating(false);
    }
  }

  return (
    <DashboardPageShell
      eyebrow="Shared ownership"
      title="Organizations"
      description="Create a BedrockNexus team, invite collaborators, and choose which GitHub App installations belong to it."
      actions={
        <Badge variant="outline">
          {organizations.data?.length ?? 0}{" "}
          {organizations.data?.length === 1 ? "organization" : "organizations"}
        </Badge>
      }
    >
      {invitations.length ? (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Organization invitations</CardTitle>
            <CardDescription>
              Accept an invitation to add its workspace to your organization switcher.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.map((invitation) => (
              <div
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                key={invitation.id}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon className="size-4" icon={UserAdd01Icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{invitation.organizationName}</p>
                  <p className="capitalize text-muted-foreground text-xs">
                    Invited as {invitation.role ?? "member"}
                  </p>
                </div>
                <Button
                  disabled={invitationBusy !== null}
                  onClick={async () => {
                    setInvitationBusy(invitation.id);
                    const result = await authClient.organization.acceptInvitation({
                      invitationId: invitation.id,
                    });
                    if (result.error) {
                      toast.error(result.error.message);
                    } else {
                      toast.success(`Joined ${invitation.organizationName}.`);
                      await organizations.refetch();
                      await loadInvitations();
                    }
                    setInvitationBusy(null);
                  }}
                >
                  Accept
                </Button>
                <Button
                  disabled={invitationBusy !== null}
                  onClick={async () => {
                    setInvitationBusy(invitation.id);
                    const result = await authClient.organization.rejectInvitation({
                      invitationId: invitation.id,
                    });
                    if (result.error) {
                      toast.error(result.error.message);
                    } else {
                      toast.success("Invitation declined.");
                      await loadInvitations();
                    }
                    setInvitationBusy(null);
                  }}
                  variant="outline"
                >
                  Decline
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="h-fit shadow-none">
          <CardHeader>
            <span className="mb-3 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HugeiconsIcon className="size-5" icon={Building03Icon} />
            </span>
            <CardTitle>Create an organization</CardTitle>
            <CardDescription>
              This is a BedrockNexus organization. GitHub access is connected separately afterward.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label htmlFor="organization-name">Name</Label>
                <Input
                  id="organization-name"
                  maxLength={64}
                  onChange={(event) => {
                    setName(event.target.value);
                    setSlug(normalizeSlug(event.target.value));
                  }}
                  placeholder="Nexus Labs"
                  required
                  value={name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization-slug">Slug</Label>
                <Input
                  id="organization-slug"
                  maxLength={48}
                  onChange={(event) => setSlug(normalizeSlug(event.target.value))}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  placeholder="nexus-labs"
                  required
                  value={slug}
                />
                <p className="text-muted-foreground text-xs">
                  bedrocknexus.com/organizations/{slug}
                </p>
              </div>
              <Button className="w-full" disabled={creating || !name.trim() || !slug} type="submit">
                {creating ? "Creating…" : "Create organization"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {organizations.isPending ? (
            <>
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-44 rounded-xl" />
            </>
          ) : organizations.data?.length ? (
            organizations.data.map((organization) => (
              <Card className="shadow-none" key={organization.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                      <HugeiconsIcon className="size-5" icon={Building03Icon} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <CardTitle>{organization.name}</CardTitle>
                      <CardDescription className="mt-1">/{organization.slug}</CardDescription>
                    </div>
                    <Badge variant="accent">Team workspace</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Link
                    className={buttonVariants()}
                    href={`/dashboard/organizations/${organization.slug}` as Route}
                  >
                    Manage workspace
                  </Link>
                  <Link
                    className={buttonVariants({ variant: "outline" })}
                    href={`/organizations/${organization.slug}` as Route}
                  >
                    Public profile
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed shadow-none">
              <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <span className="grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <HugeiconsIcon className="size-6" icon={UserGroupIcon} />
                </span>
                <h2 className="mt-5 font-semibold text-lg">Your first team starts here</h2>
                <p className="mt-2 max-w-md text-muted-foreground text-sm leading-6">
                  Create an organization on the left. You can then invite members and connect a
                  GitHub App installation for its repositories.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardPageShell>
  );
}

export function OrganizationWorkspace({ slug }: { slug: string }) {
  const [organization, setOrganization] = useState<FullOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrganizationRole>("member");
  const [busy, setBusy] = useState<string | null>(null);

  const loadOrganization = useCallback(async () => {
    setLoading(true);
    const result = await authClient.organization.getFullOrganization({
      query: { organizationSlug: slug },
    });
    if (result.error) {
      toast.error(result.error.message);
      setOrganization(null);
    } else {
      setOrganization(result.data as FullOrganization | null);
      if (result.data) {
        await authClient.organization.setActive({ organizationId: result.data.id });
      }
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    void loadOrganization();
  }, [loadOrganization]);

  const currentMembership = authClient.useActiveMember();
  const canManage =
    currentMembership.data?.role?.split(",").some((role) => role === "owner" || role === "admin") ??
    false;

  const pendingInvitations = useMemo(
    () => organization?.invitations.filter((invitation) => invitation.status === "pending") ?? [],
    [organization],
  );

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label);
    try {
      await action();
      await loadOrganization();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!organization) {
    return (
      <DashboardPageShell
        eyebrow="Organization workspace"
        title="Organization not found"
        description="This organization does not exist or your account is not a member."
      >
        <Link className={buttonVariants({ variant: "outline" })} href="/dashboard/organizations">
          Back to organizations
        </Link>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      eyebrow="Organization workspace"
      title={organization.name}
      description={`Manage members, publishing ownership, and repository access for /${organization.slug}.`}
      actions={
        <div className="flex flex-wrap gap-2">
          <a
            className={cn(buttonVariants(), "gap-2")}
            href={`/api/github/install?organization=${encodeURIComponent(organization.slug)}`}
          >
            <HugeiconsIcon className="size-4" icon={GithubIcon} />
            Connect GitHub App
          </a>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={`/organizations/${organization.slug}` as Route}
          >
            Public profile
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <WorkspaceMetric icon={UserGroupIcon} label="Members" value={organization.members.length} />
        <WorkspaceMetric
          icon={UserAdd01Icon}
          label="Pending invites"
          value={pendingInvitations.length}
        />
        <WorkspaceMetric icon={Package01Icon} label="Ownership" value="Team" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Better Auth roles control who can manage this workspace and its publishing links.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {organization.members.map((member) => (
              <div
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                key={member.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{member.user.name}</p>
                  <p className="truncate text-muted-foreground text-xs">{member.user.email}</p>
                </div>
                {canManage && member.role !== "owner" ? (
                  <>
                    <select
                      aria-label={`Role for ${member.user.name}`}
                      className="h-9 rounded-md border bg-background px-3 text-sm"
                      disabled={busy !== null}
                      onChange={(event) =>
                        void run(`role-${member.id}`, async () => {
                          const result = await authClient.organization.updateMemberRole({
                            memberId: member.id,
                            organizationId: organization.id,
                            role: event.target.value as OrganizationRole,
                          });
                          if (result.error) throw new Error(result.error.message);
                          toast.success("Member role updated.");
                        })
                      }
                      value={member.role}
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                    <Button
                      aria-label={`Remove ${member.user.name}`}
                      disabled={busy !== null}
                      onClick={() =>
                        void run(`remove-${member.id}`, async () => {
                          const result = await authClient.organization.removeMember({
                            memberIdOrEmail: member.id,
                            organizationId: organization.id,
                          });
                          if (result.error) throw new Error(result.error.message);
                          toast.success("Member removed.");
                        })
                      }
                      size="icon"
                      variant="outline"
                    >
                      <HugeiconsIcon className="size-4" icon={Delete02Icon} />
                    </Button>
                  </>
                ) : (
                  <Badge className="capitalize" variant="outline">
                    {member.role}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Invite a member</CardTitle>
              <CardDescription>Invite by email and choose their initial role.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run("invite", async () => {
                    const result = await authClient.organization.inviteMember({
                      email: email.trim(),
                      organizationId: organization.id,
                      role: inviteRole,
                    });
                    if (result.error) throw new Error(result.error.message);
                    setEmail("");
                    toast.success("Invitation sent.");
                  });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    disabled={!canManage || busy !== null}
                    id="invite-email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="creator@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    disabled={!canManage || busy !== null}
                    id="invite-role"
                    onChange={(event) => setInviteRole(event.target.value as OrganizationRole)}
                    value={inviteRole}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button className="w-full" disabled={!canManage || busy !== null} type="submit">
                  <HugeiconsIcon className="size-4" icon={UserAdd01Icon} />
                  Invite member
                </Button>
              </form>
            </CardContent>
          </Card>

          {pendingInvitations.length ? (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Pending invitations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingInvitations.map((invitation) => (
                  <div className="rounded-lg border p-3" key={invitation.id}>
                    <p className="truncate font-medium text-sm">{invitation.email}</p>
                    <p className="mt-1 capitalize text-muted-foreground text-xs">
                      {invitation.role ?? "member"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </DashboardPageShell>
  );
}

function WorkspaceMetric({
  icon,
  label,
  value,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
  label: string;
  value: number | string;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-4 p-5">
        <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
          <HugeiconsIcon className="size-4" icon={icon} />
        </span>
        <span>
          <span className="block text-muted-foreground text-sm">{label}</span>
          <span className="block font-bold text-2xl tracking-tight">{value}</span>
        </span>
      </CardContent>
    </Card>
  );
}
