"use client";

import { updateProfileAction } from "@/app/actions/user_action";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
// import { Switch } from "./ui/switch";
import { useState, useTransition } from "react";
import { Switch } from "./ui/switch";

export default function SettingsForms({
  user,
}: {
  user: { firstName: string; lastName: string; email: string };
}) {
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // example preference states
  const [emailNotif, setEmailNotif] = useState(true);
  const [marketingNotif, setMarketingNotif] = useState(false);

  function handleProfile(formData: FormData) {
    setProfileMsg(null);
    startTransition(async () => {
      const res = await updateProfileAction(formData);
      setProfileMsg(res.error || res.success || null);
    });
  }

  return (
    <div className="space-y-8">

      {/* Profile Card */}
      <form action={handleProfile}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={user.firstName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={user.lastName}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>

            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Update Profile"}
            </Button>

            {profileMsg && (
              <p className="text-sm text-muted-foreground">{profileMsg}</p>
            )}
          </CardContent>
        </Card>
      </form>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive order updates by email
              </p>
            </div>
            <Switch
              checked={emailNotif}
              onCheckedChange={setEmailNotif}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing Emails</p>
              <p className="text-sm text-muted-foreground">
                Get product & feature updates
              </p>
            </div>
            <Switch
              checked={marketingNotif}
              onCheckedChange={setMarketingNotif}
            />
          </div>

        </CardContent>
      </Card>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Type</span>
            <span>User</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="text-green-600">Active</span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}