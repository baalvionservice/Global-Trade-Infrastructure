import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import { DepartmentWizard } from '../_components/department-wizard';
import { DEPARTMENT_SLUGS, getDepartmentConfig } from '../_lib/department-configs';

/**
 * @file onboard/[department]/page.tsx
 * @description Server entry for department onboarding wizards. Validates the slug,
 * owns SEO, and renders the shared client wizard. Static siblings (buyer, seller)
 * keep their own routes; this handles banking, customs, logistics, enterprise.
 */

export function generateStaticParams() {
  return DEPARTMENT_SLUGS.map((department) => ({ department }));
}

export async function generateMetadata({ params }: { params: Promise<{ department: string }> }): Promise<Metadata> {
  const { department } = await params;
  const config = getDepartmentConfig(department);
  if (!config) return pageMetadata({ title: 'Onboarding', description: 'Join the Baalvion verified trade network.', path: '/onboard' });
  return pageMetadata({
    title: config.title,
    description: `${config.eyebrow} — complete verification to join Baalvion as a ${department} partner.`,
    path: `/onboard/${department}`,
    keywords: ['onboarding', department, 'trade verification', 'KYC', 'institutional access'],
  });
}

export default async function DepartmentOnboardingPage({ params }: { params: Promise<{ department: string }> }) {
  const { department } = await params;
  if (!getDepartmentConfig(department)) notFound();
  return <DepartmentWizard department={department} />;
}
