import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  User, Mail, Building2, Phone, MapPin, CreditCard, ShieldCheck, Trash2, KeyRound, Ban, CheckCircle,
} from "lucide-react";
import type { MockUser } from "@/data/mockUsers";
import { toast } from "sonner";

interface UserDetailDialogProps {
  user: MockUser | null;
  open: boolean;
  onClose: () => void;
}

const orderStatusColor: Record<string, string> = {
  completed: "border-success text-success",
  processing: "border-accent text-accent",
  shipped: "border-primary text-primary",
  cancelled: "border-destructive text-destructive",
};

const subStatusColor: Record<string, string> = {
  active: "border-success text-success",
  past_due: "border-destructive text-destructive",
  cancelled: "border-muted-foreground text-muted-foreground",
};

const UserDetailDialog = ({ user, open, onClose }: UserDetailDialogProps) => {
  const [tab, setTab] = useState("profile");

  if (!user) return null;

  const handleAction = (action: string) => {
    toast.success(`${action} action triggered for ${user.name}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl w-full overflow-y-auto bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
              dark:from-[#0b0e12]/90 dark:via-[#1e232a]/90 dark:to-[#0b0b0e]/90 justify-center items-center border border-gray-200 dark:border-gray-600/70">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{user.name}</DialogTitle>
          <DialogDescription>{user.company} · {user.email}</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={User} label="Full Name" value={user.name} />
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Building2} label="Company" value={user.company} />
              <InfoRow icon={Phone} label="Phone" value={user.phone} />
              <InfoRow icon={MapPin} label="Address" value={user.address} />
              <InfoRow icon={ShieldCheck} label="Role" value={user.role} />
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <span className="text-sm text-muted-foreground">Account Status</span>
              <Badge variant="outline" className={user.status === "active" ? "border-success text-success" : "border-destructive text-destructive"}>
                {user.status}
              </Badge>
              <span className="ml-auto text-sm text-muted-foreground">
                {user.orders} orders · ${user.totalSpent.toLocaleString()} total spent
              </span>
            </div>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.orderHistory.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell>{o.service}</TableCell>
                    <TableCell>{o.quantity.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${orderStatusColor[o.status] ?? ""}`}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${o.total.toLocaleString()}</TableCell>
                    <TableCell>{new Date(o.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Subscription */}
          <TabsContent value="subscription" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={CreditCard} label="Plan" value={user.subscription.plan} />
              <InfoRow icon={CreditCard} label="Billing Cycle" value={user.subscription.billingCycle} />
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className={`capitalize ${subStatusColor[user.subscription.status] ?? ""}`}>
                  {user.subscription.status.replace("_", " ")}
                </Badge>
              </div>
              <InfoRow icon={CreditCard} label="Renewal Date" value={new Date(user.subscription.renewalDate).toLocaleDateString()} />
            </div>
            <div>
              <h4 className="mb-2 font-heading text-sm font-semibold text-foreground">Payment History</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.subscription.paymentHistory.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                      <TableCell>${p.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${p.status === "paid" ? "border-success text-success" : "border-destructive text-destructive"}`}>
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Actions */}
          <TabsContent value="actions" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ActionButton icon={User} label="View Profile" onClick={() => handleAction("View profile")} />
              <ActionButton icon={Mail} label="Edit User Details" onClick={() => handleAction("Edit user")} />
              <ActionButton icon={KeyRound} label="Reset Password" onClick={() => handleAction("Reset password")} />
              <ActionButton
                icon={user.status === "active" ? Ban : CheckCircle}
                label={user.status === "active" ? "Suspend Account" : "Activate Account"}
                onClick={() => handleAction(user.status === "active" ? "Suspend" : "Activate")}
                destructive={user.status === "active"}
              />
              <ActionButton icon={CreditCard} label="View Order History" onClick={() => { setTab("orders"); }} />
              <ActionButton icon={Trash2} label="Delete Account" onClick={() => handleAction("Delete account")} destructive />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium capitalize text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, destructive }: { icon: React.ElementType; label: string; onClick: () => void; destructive?: boolean }) {
  return (
    <Button
      variant="outline"
      className={`justify-start gap-2 ${destructive ? "border-destructive/30 text-destructive hover:bg-destructive/10" : ""}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}

export default UserDetailDialog;
