import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 26, 2023";

  return (
    <div className="bg-background text-foreground">
      <div className="container py-20 md:py-28 max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last Updated: {lastUpdated}
          </p>
        </header>

        <div className="bg-card p-8 md:p-12 rounded-lg border shadow-sm text-left space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Baalvion Industries Pvt. Ltd. ("Baalvion", "we", "us", "our") is committed to protecting the privacy and security of the data on our platform. This Privacy Policy explains how we collect, use, process, and disclose information in relation to our institutional-grade operating system for global trade (the "Platform"). This policy applies to Verified Institutions and their authorized users.
          </p>

          <Separator className="my-8" />

          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">Our data collection is strictly limited to what is necessary for the operation, security, and compliance of the Platform.</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Institutional Data:</strong> Data that your institution and its authorized users submit to the Platform, such as trade documents, transaction details, and communications. Your institution owns and controls this data. We process it solely on your behalf as a data processor.</li>
              <li><strong>User Account Information:</strong> To create and manage user accounts, we collect information such as name, official institutional email address, role, and permissions. This information is used for authentication, authorization, and communication.</li>
              <li><strong>System and Usage Data:</strong> We automatically collect technical data about interactions with the Platform. This includes IP addresses, device types, browser information, API call logs, and feature usage patterns. This data is used for security monitoring, performance optimization, and audit purposes. It is never used to profile individuals.</li>
            </ul>

            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">2. How We Use Information</h2>
            <p className="text-muted-foreground leading-relaxed">We use the information we collect for the sole purpose of providing and maintaining the Platform. This includes:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Operating and maintaining the Platform's core functionalities, including trade execution, settlement orchestration, and compliance checks.</li>
              <li>Authenticating users and enforcing role-based access controls.</li>
              <li>Monitoring the Platform for security threats, fraud, and malicious activity.</li>
              <li>Providing support, responding to inquiries, and communicating system updates.</li>
              <li>Complying with our legal, regulatory, and audit obligations.</li>
              <li>Generating anonymized and aggregated statistical data for system performance and trend analysis. We never use institutional data for this purpose without explicit, jurisdiction-aware consent.</li>
            </ul>

            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">3. Information Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">Baalvion is not a data broker. We do not sell or rent institutional or personal data. Information sharing is strictly limited to the following circumstances:</p>
             <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Within Your Institution:</strong> Your Institutional Data is accessible to authorized users within your institution based on the roles and permissions you define.</li>
              <li><strong>With Trade Counterparties:</strong> Information is shared with other institutions on the Platform only as necessary to execute a trade transaction in which you are a party. This is governed by the rules of the platform and the agreements between institutions.</li>
              <li><strong>Service Providers:</strong> We may use third-party service providers (e.g., cloud hosting, security services) to help us operate the Platform. These providers are contractually bound to protect data and are not permitted to use it for any other purpose.</li>
              <li><strong>Legal Compliance and Law Enforcement:</strong> We may disclose information if required by law, subpoena, or other legal process, or if we have a good faith belief that disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
            </ul>

            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement and maintain institutional-grade technical, physical, and administrative security measures designed to protect data from loss, misuse, and unauthorized access. These measures include end-to-end encryption, network segmentation, strict access controls, and regular security audits.
            </p>

            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain data only for as long as necessary to fulfill the purposes outlined in this policy, to comply with our contractual obligations to your institution, and as required by applicable law and regulatory record-keeping requirements.
            </p>

            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">6. Your Rights and Choices</h2>
            <p className="text-muted-foreground leading-relaxed">
              As we are a data processor for your Institutional Data, your institution's administrator is responsible for managing user accounts and data. Authorized users should contact their institutional administrator to exercise any data rights (e.g., access, correction, deletion).
            </p>

            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">7. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will provide notice of material changes through the Platform's institutional communication channels.
            </p>

            <h2 className="text-2xl font-medium text-foreground tracking-tight border-b pb-2 pt-4">8. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions or concerns about our privacy practices, please contact our Platform Governance team at <a href="mailto:governance@baalvion.com" className="text-primary hover:underline">governance@baalvion.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
