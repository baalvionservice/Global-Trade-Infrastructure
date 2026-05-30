import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ShieldAlert } from 'lucide-react';
import { PATHS } from "@/lib/paths";

export default function AccessRequestPage() {
  return (
    <div className="bg-muted/50">
      <div className="container py-20 md:py-28 max-w-4xl">
        <Card className="border-0 md:border shadow-none md:shadow-sm bg-card">
          <CardHeader className="text-center p-6 md:p-8">
            <CardTitle className="text-2xl md:text-3xl">Request Platform Access</CardTitle>
            <CardDescription className="text-md text-muted-foreground max-w-2xl mx-auto pt-2">
              Baalvion is a regulated, institution-grade trade infrastructure. Access is strictly limited to verified organizations and is granted following a formal review process.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0">
            <form className="space-y-8">
              
              <div className="space-y-6 p-6 border rounded-lg bg-muted/30">
                <h3 className="text-lg font-medium text-foreground">1. Institution Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="institution-name">Official Institution Name</Label>
                    <Input id="institution-name" placeholder="e.g., Global Bank Corporation" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution-type">Institution Type</Label>
                    <Select>
                      <SelectTrigger id="institution-type">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank / Financial Institution</SelectItem>
                        <SelectItem value="government">Government / Sovereign Entity</SelectItem>
                        <SelectItem value="regulator">Regulator</SelectItem>
                        <SelectItem value="enterprise">Enterprise (Importer/Exporter)</SelectItem>
                        <SelectItem value="logistics">Logistics / Supply Chain Operator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="jurisdiction">Primary Country / Jurisdiction of Operation</Label>
                    <Input id="jurisdiction" placeholder="e.g., Singapore, European Union, United States" />
                  </div>
              </div>
              
              <div className="space-y-6 p-6 border rounded-lg bg-muted/30">
                 <h3 className="text-lg font-medium text-foreground">2. Authorized Representative Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" placeholder="e.g., Jane Doe" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="role">Role / Title</Label>
                    <Input id="role" placeholder="e.g., Head of Trade Finance" />
                  </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label htmlFor="email">Official Email Address</Label>
                    <Input id="email" type="email" placeholder="e.g., j.doe@global-bank.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Official Contact Number</Label>
                    <Input id="phone" placeholder="e.g., +1-202-555-0104" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 p-6 border rounded-lg bg-red-500/5 dark:bg-red-500/10 border-destructive/20">
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-destructive"/>3. Compliance Declaration</h3>
                <div className="items-start flex space-x-3 pt-2">
                    <input type="checkbox" id="terms" className="mt-1 h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                    <div className="grid gap-1.5 leading-none">
                        <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                        I hereby confirm that I am an authorized representative of the specified institution with the authority to request platform access.
                        </label>
                        <p className="text-sm text-muted-foreground">
                        By submitting this request, you acknowledge and accept the platform's governance principles and terms of institutional access. All information provided is subject to verification.
                        </p>
                    </div>
                </div>
              </div>
              
               <div className="flex flex-col items-center pt-6">
                <Button size="lg" asChild>
                    <Link href={PATHS.ACCESS_PENDING}>Submit Secure Access Request</Link>
                </Button>
                 <p className="mt-4 text-xs text-muted-foreground text-center max-w-sm">
                    Our governance team will review your request and respond through official channels only. This is a final, binding submission.
                 </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
