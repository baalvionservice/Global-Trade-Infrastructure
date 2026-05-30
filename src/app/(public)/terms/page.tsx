import { Separator } from "@/components/ui/separator";

export default function TermsOfUsePage() {
  const lastUpdated = "October 26, 2023";

  return (
    <div className="bg-background text-foreground">
      <div className="container py-20 md:py-28 max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
            Terms of Use
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last Updated: {lastUpdated}
          </p>
        </header>

        <div className="bg-card p-8 md:p-12 rounded-lg border shadow-sm text-left space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            These Terms of Use ("Terms") govern your access to and use of the Baalvion platform, including all associated software, APIs, documentation, and services (collectively, the "Platform"). These Terms constitute a legally binding agreement between you, the institution you represent ("Institution"), and Baalvion Industries Pvt. Ltd. ("Baalvion", "we", "us", "our").
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            By accessing or using the Platform, you confirm that you are an authorized representative of your Institution with the authority to bind the Institution to these Terms, and you agree on behalf of your Institution to be bound by these Terms.
          </p>

          <Separator className="my-8" />

          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2">1. Eligibility and Access</h2>
            <p className="text-muted-foreground leading-relaxed">
              Access to the Platform is strictly limited to verified financial institutions, government bodies, regulatory authorities, and qualified enterprises that have completed our institutional onboarding process ("Verified Institutions"). Access is granted via secure credentials and is non-transferable. You are responsible for maintaining the confidentiality of your access credentials and for all activities that occur under your account.
            </p>
            
            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">2. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">You and your Institution agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the Platform for any illegal purpose or in violation of any local, state, national, or international law or regulation, including sanctions regimes.</li>
              <li>Breach, or attempt to breach, the security and authentication measures of the Platform.</li>
              <li>Interfere with the operation of the Platform or any user's enjoyment of it, including by uploading or otherwise disseminating any virus, adware, spyware, worm, or other malicious code.</li>
              <li>Use any robot, spider, or other automated means to access the Platform for any purpose without our express written permission.</li>
              <li>Reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code of the Platform.</li>
            </ul>

            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">3. Data, Confidentiality, and Intellectual Property</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p><strong>3.1. Institutional Data.</strong> Your Institution retains all right, title, and interest in and to the data it submits to the Platform ("Institutional Data"). You grant Baalvion a limited, non-exclusive, worldwide, royalty-free license to use, copy, display, and process Institutional Data solely for the purpose of operating, maintaining, and improving the Platform and fulfilling its obligations under our agreement.</p>
              <p><strong>3.2. Platform IP.</strong> Baalvion and its licensors retain all right, title, and interest, including all intellectual property rights, in and to the Platform and its underlying technology. No rights or licenses are granted to you or your Institution except as expressly set forth herein.</p>
              <p><strong>3.3. Confidentiality.</strong> "Confidential Information" includes all non-public information disclosed by one party to the other, including but not limited to Institutional Data and all information relating to the Platform's architecture and performance. Each party agrees to protect the other's Confidential Information with the same degree of care that it uses to protect its own confidential information of a similar nature, but in no event less than reasonable care.</p>
            </div>
            
            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">4. Disclaimers and Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND. BAALVION EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL BAALVION, ITS AFFILIATES, OFFICERS, DIRECTORS, OR EMPLOYEES BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING, WITHOUT LIMITATION, LOSS OF PROFITS, DATA, OR GOODWILL) ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR THE USE OR INABILITY TO USE THE PLATFORM.
            </p>
            
            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">5. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your access to the Platform at any time, with or without cause or notice, for any reason, including if we believe you have violated these Terms. Upon termination, your right to use the Platform will immediately cease, and we may, in our sole discretion, delete your Institution's account and data.
            </p>
            
            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">6. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India, without regard to its conflict of law principles. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.
            </p>

            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">7. Modifications to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. If we make material changes, we will provide notice through the Platform or by other means. Your continued use of the Platform after such notice constitutes your acceptance of the modified Terms.
            </p>

            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">8. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions about these Terms, please contact our legal and governance team at <a href="mailto:governance@baalvion.com" className="text-primary hover:underline">governance@baalvion.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
