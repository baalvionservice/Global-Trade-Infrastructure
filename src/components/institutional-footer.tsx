'use client';

import Link from 'next/link';
import { BaalvionLogo } from '@/components/icons';
import * as React from 'react';
import { PATHS } from '@/lib/paths';

/**
 * @file institutional-footer.tsx
 * @description The official footer for the public-facing institutional website.
 * It provides a comprehensive sitemap and legal information, designed to pass bank and government scrutiny.
 */
export function InstitutionalFooter() {
    const [year, setYear] = React.useState<number | null>(null);

    React.useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="bg-muted text-muted-foreground">
            <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2 mb-8 md:mb-0">
                        <div className="flex items-center gap-2 mb-4">
                            <BaalvionLogo className="h-8 w-8 text-primary" />
                            <h2 className="text-xl font-semibold text-foreground">Baalvion</h2>
                        </div>
                        <p className="text-sm max-w-md">The neutral digital infrastructure enabling compliant, transparent, and intelligent global trade across institutions and jurisdictions.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href={PATHS.PLATFORM} className="hover:text-foreground">Platform Overview</Link></li>
                            <li><Link href={PATHS.PLATFORM} className="hover:text-foreground">Capabilities</Link></li>
                            <li><Link href={PATHS.ABOUT} className="hover:text-foreground">How It Works</Link></li>
                            <li><Link href={PATHS.INTELLIGENCE_HUB} className="hover:text-foreground">Intelligence & Oversight</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Solutions</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href={PATHS.SOLUTIONS_BANKS} className="hover:text-foreground">For Banks</Link></li>
                            <li><Link href={PATHS.SOLUTIONS_GOV} className="hover:text-foreground">For Governments & Regulators</Link></li>
                            <li><Link href={PATHS.SOLUTIONS_ENTERPRISES} className="hover:text-foreground">For Enterprises</Link></li>
                            <li><Link href={PATHS.SOLUTIONS_LOGISTICS} className="hover:text-foreground">For Logistics & Shipping</Link></li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-foreground mb-4">Governance & Trust</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href={PATHS.ABOUT} className="hover:text-foreground">Compliance Framework</Link></li>
                            <li><Link href={PATHS.PLATFORM} className="hover:text-foreground">Data & Security Principles</Link></li>
                            <li><Link href={PATHS.ABOUT} className="hover:text-foreground">Regulatory Alignment</Link></li>
                            <li><Link href={PATHS.ACCESS_REQUEST} className="hover:text-foreground">Institutional Access Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between text-sm">
                    <p className='mb-4 sm:mb-0'>&copy; {year ? year : ''} Baalvion Industries Pvt. Ltd.</p>
                    <div className="flex items-center gap-4">
                        <Link href={PATHS.PRIVACY_POLICY} className="hover:text-foreground">Privacy Policy</Link>
                        <Link href={PATHS.TERMS_OF_USE} className="hover:text-foreground">Terms of Use</Link>
                        <Link href={PATHS.CONTACT} className="hover:text-foreground">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
