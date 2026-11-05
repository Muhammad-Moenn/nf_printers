"use client";

import { updateEmailPreferencesAction, updateProfileAction } from "@/app/actions/user_action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Check, Info, UserRound } from "lucide-react";
import { useState, useTransition } from "react";

type SettingsUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
};

export default function SettingsForms({ user }: { user: SettingsUser }) {
  const [profileMsg, setProfileMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [emailNotif, setEmailNotif] = useState(user.emailNotifications);
  const [marketingNotif, setMarketingNotif] = useState(user.marketingEmails);
  const [preferenceMsg, setPreferenceMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleProfile(formData: FormData) {
    setProfileMsg(null);
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      setProfileMsg(result.error
        ? { text: result.error, error: true }
        : { text: result.success ?? "Profile saved.", error: false });
    });
  }

  function savePreference(kind: "emailNotifications" | "marketingEmails", value: boolean) {
    const previous = kind === "emailNotifications" ? emailNotif : marketingNotif;
    if (kind === "emailNotifications") setEmailNotif(value);
    else setMarketingNotif(value);
    setPreferenceMsg(null);
    startTransition(async () => {
      const next = kind === "emailNotifications"
        ? { emailNotifications: value, marketingEmails: marketingNotif }
        : { emailNotifications: emailNotif, marketingEmails: value };
      const result = await updateEmailPreferencesAction(next);
      if (result.error) {
        if (kind === "emailNotifications") setEmailNotif(previous);
        else setMarketingNotif(previous);
        setPreferenceMsg(result.error);
      } else setPreferenceMsg("Preferences saved.");
    });
  }

  const card = "rounded-2xl border border-border/70 bg-card shadow-sm";
  const iconBadge = "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary";
  const sectionHeader = (icon: React.ReactNode, title: string) => (
    <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
      <span className={iconBadge}>{icon}</span>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
    </div>
  );

  return (
    <div className="space-y-6">
      <form action={handleProfile}>
        <Card className={card}>
          <CardContent className="p-5 sm:p-7">
            {sectionHeader(<UserRound className="size-5" />, "Personal Details")}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" name="firstName" required maxLength={80} defaultValue={user.firstName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" required maxLength={80} defaultValue={user.lastName} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} readOnly aria-describedby="email-note" className="bg-muted/60" />
                <p id="email-note" className="text-xs text-muted-foreground">Email address is managed by your sign-in provider.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Button disabled={pending} type="submit">{pending ? "Saving…" : "Save changes"}</Button>
              {profileMsg && <p role="status" className={`text-sm ${profileMsg.error ? "text-destructive" : "text-emerald-600"}`}>{profileMsg.text}</p>}
            </div>
          </CardContent>
        </Card>
      </form>

      <Card className={card}>
        <CardContent className="p-5 sm:p-7">
          {sectionHeader(<Bell className="size-5" />, "Preferences")}
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between gap-5 py-4 first:pt-0">
              <div><p className="font-medium">Email notifications</p><p className="mt-1 text-sm text-muted-foreground">Receive important account and order updates</p></div>
              <Switch aria-label="Email notifications" disabled={pending} checked={emailNotif} onCheckedChange={(value) => savePreference("emailNotifications", value)} />
            </div>
            <div className="flex items-center justify-between gap-5 pt-4">
              <div><p className="font-medium">Marketing emails</p><p className="mt-1 text-sm text-muted-foreground">Occasional news and product updates</p></div>
              <Switch aria-label="Marketing emails" disabled={pending} checked={marketingNotif} onCheckedChange={(value) => savePreference("marketingEmails", value)} />
            </div>
          </div>
          {preferenceMsg && <p role="status" className="mt-4 text-sm text-muted-foreground">{preferenceMsg}</p>}
          <p className="mt-3 text-xs text-muted-foreground">Password recovery and essential security emails remain enabled.</p>
        </CardContent>
      </Card>

      <Card className={card}>
        <CardContent className="p-5 sm:p-7">
          {sectionHeader(<Info className="size-5" />, "Account information")}
          <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-[minmax(130px,200px)_1fr]">
            <dt className="text-muted-foreground">Email</dt><dd className="break-all font-medium">{user.email}</dd>
            <dt className="text-muted-foreground">Account type</dt><dd className="font-medium">{user.role === "CUSTOMER" ? "Customer" : user.role.charAt(0) + user.role.slice(1).toLowerCase()}</dd>
            <dt className="text-muted-foreground">Account status</dt><dd className="flex items-center gap-2 font-medium text-emerald-600"><Check className="size-4" /> Active</dd>
            <dt className="text-muted-foreground">Member since</dt><dd className="font-medium">{new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
