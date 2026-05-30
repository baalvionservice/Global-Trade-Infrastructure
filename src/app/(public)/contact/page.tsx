import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Users, Building, Shield } from 'lucide-react';
import Link from 'next/link';

/**
 * @file src/app/contact/page.tsx
 * @description The institutional contact page for Baalvion.
 */
export default function ContactPage() {
  return (
    <div className="bg-muted/50">
        <div className="container py-20 md:py-28 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-16 items-start">
                <div className="space-y-6">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</p>
                    <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Institutional Inquiries</h1>
                    <p className="text-lg text-muted-foreground">
                        For institutional inquiries, please use the provided form or contact the relevant department directly. Our team operates on a confidential, institution-to-institution basis.
                    </p>
                    <Separator className="my-6"/>
                    <div className="space-y-6 pt-4">
                        <div className="flex items-start gap-4">
                            <Users className="w-6 h-6 text-primary mt-1"/>
                            <div>
                                <h3 className="font-semibold text-foreground">Institutional Onboarding</h3>
                                <p className="text-muted-foreground text-sm">For new banks, governments, or enterprises seeking to join the platform.</p>
                                <Link href="mailto:onboarding@baalvion.com" className="text-sm text-primary hover:underline">onboarding@baalvion.com</Link>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Building className="w-6 h-6 text-primary mt-1"/>
                            <div>
                                <h3 className="font-semibold text-foreground">Technical Integration</h3>
                                <p className="text-muted-foreground text-sm">For technical teams evaluating or implementing Baalvion's APIs.</p>
                                <Link href="mailto:support.integration@baalvion.com" className="text-sm text-primary hover:underline">support.integration@baalvion.com</Link>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Shield className="w-6 h-6 text-primary mt-1"/>
                            <div>
                                <h3 className="font-semibold text-foreground">Platform Governance & Trust</h3>
                                <p className="text-muted-foreground text-sm">For inquiries related to compliance, security, and data governance.</p>
                                <Link href="mailto:governance@baalvion.com" className="text-sm text-primary hover:underline">governance@baalvion.com</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle>Submit an Inquiry</CardTitle>
                        <CardDescription>All fields are required. We only respond to official institutional email addresses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" placeholder="Jane Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Official Email</Label>
                                    <Input id="email" type="email" placeholder="j.doe@institution.gov" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="institution">Institution</Label>
                                <Input id="institution" placeholder="e.g., Central Bank of Example" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Inquiry Subject</Label>
                                <Select>
                                    <SelectTrigger id="subject">
                                        <SelectValue placeholder="Select subject..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="onboarding">Institutional Onboarding</SelectItem>
                                        <SelectItem value="technical">Technical Integration</SelectItem>
                                        <SelectItem value="governance">Governance & Compliance</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Please describe your inquiry in detail." rows={5} />
                            </div>
                            <Button type="submit" className="w-full">
                                Submit Inquiry <ArrowRight className="ml-2 w-4 h-4"/>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
