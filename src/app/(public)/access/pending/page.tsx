import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Mail, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PATHS } from "@/lib/paths";


export default function AccessPendingPage() {
    const nextSteps: { title: string; description: string; icon: LucideIcon }[] = [
        {
            title: "Institutional Verification",
            description: "Your organization's details will be validated against official records.",
            icon: UserCheck
        },
        {
            title: "Governance Review",
            description: "The requested scope and role will be reviewed by our governance team.",
            icon: ShieldCheck
        },
        {
            title: "Secure Communication",
            description: "Onboarding instructions will be sent to your registered official email address upon approval.",
            icon: Mail
        },
    ]

  return (
    <div className="bg-muted/50">
      <div className="container flex min-h-[80vh] items-center justify-center py-20 md:py-28">
        <Card className="w-full max-w-2xl text-center border-0 md:border shadow-none md:shadow-sm bg-card">
          <CardHeader className="p-6 md:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl md:text-3xl">Your Access Request Is Under Review</CardTitle>
            <CardDescription className="text-md text-muted-foreground pt-2 max-w-xl mx-auto">
              Thank you for your interest in the Baalvion platform. Your request has been securely submitted to our institutional governance team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 md:p-8 pt-0">
            <p className="text-muted-foreground">
              Our institutional review team is validating your request. This process ensures platform integrity, regulatory alignment, and secure participation for all stakeholders.
            </p>

            <div className="text-left bg-muted/80 p-6 rounded-lg border">
               <h4 className="font-medium mb-4 text-foreground flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary"/> What Happens Next:</h4>
               <div className="space-y-6">
                {nextSteps.map(step => (
                    <div key={step.title} className="flex items-start gap-4">
                        <step.icon className="w-6 h-6 text-primary mt-1 shrink-0"/>
                        <div>
                            <h5 className="font-medium text-foreground/90">{step.title}</h5>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                    </div>
                ))}
               </div>
            </div>
            
            <div className="pt-4">
                <Button asChild variant="outline">
                <Link href={PATHS.HOME}>Return to Homepage</Link>
                </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
