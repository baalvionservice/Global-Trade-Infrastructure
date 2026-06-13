'use client';

/**
 * @file trade-ops/[id]/page.tsx
 * @description Shipment detail — the single-shipment command surface. One shipment id drives every
 * operational domain: overview/tracking, workflow lifecycle, readiness, documents, compliance,
 * logistics, customs, dispatch, and HS classification. All tabs consume live trade-service data
 * through React Query; actions are role-gated (the API remains authoritative).
 */
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAppState } from '@/app/(dashboard)/_components/app-state';
import { canEdit, canApprove } from '@/core/authorization';
import { useShipment, useReadiness, errorMessage } from '@/api';
import { LoadingState, ErrorState, ScoreBar, num } from '../_components/ui-states';
import { ShipmentStatusBadge, ReadinessBandBadge } from '../_components/badges';
import { OverviewPanel } from '../_components/overview-panel';
import { WorkflowPanel } from '../_components/workflow-panel';
import { ReadinessPanel } from '../_components/readiness-panel';
import { DocumentsPanel } from '../_components/documents-panel';
import { CompliancePanel } from '../_components/compliance-panel';
import { LogisticsPanel } from '../_components/logistics-panel';
import { CustomsPanel } from '../_components/customs-panel';
import { DispatchPanel } from '../_components/dispatch-panel';
import { HsPanel } from '../_components/hs-panel';

export default function ShipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { authz } = useAppState();
  const mayEdit = canEdit(authz);
  const mayApprove = canApprove(authz);

  const { data: shipment, isLoading, isError, error, refetch } = useShipment(id, { poll: true });
  const readiness = useReadiness(id);

  if (isLoading) return <main className="flex flex-1 items-center justify-center p-8"><LoadingState label="Loading shipment…" /></main>;
  if (isError || !shipment) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <ErrorState message={errorMessage(error) || 'Shipment not found'} onRetry={() => void refetch()} />
        <Button variant="outline" onClick={() => router.push('/trade-ops')}>Back to Trade Operations</Button>
      </main>
    );
  }

  const score = readiness.data ? num(readiness.data.readiness_score) : null;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/trade-ops')} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {shipment.tracking_number ?? `Shipment #${shipment.id}`}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <ShipmentStatusBadge status={shipment.status} />
              {readiness.data && <ReadinessBandBadge band={readiness.data.band} />}
            </div>
          </div>
        </div>
        {score !== null && (
          <Card className="w-56">
            <CardContent className="py-3">
              <ScoreBar label="Readiness" value={score} />
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="readiness">Readiness</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
          <TabsTrigger value="customs">Customs</TabsTrigger>
          <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
          <TabsTrigger value="hs">HS Code</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewPanel shipment={shipment} mayEdit={mayEdit} /></TabsContent>
        <TabsContent value="workflow"><WorkflowPanel shipmentId={id} mayEdit={mayEdit} /></TabsContent>
        <TabsContent value="readiness"><ReadinessPanel shipmentId={id} mayEdit={mayEdit} /></TabsContent>
        <TabsContent value="documents"><DocumentsPanel shipmentId={id} mayEdit={mayEdit} mayApprove={mayApprove} /></TabsContent>
        <TabsContent value="compliance"><CompliancePanel shipmentId={id} mayEdit={mayEdit} /></TabsContent>
        <TabsContent value="logistics"><LogisticsPanel shipmentId={id} shipment={shipment} mayEdit={mayEdit} /></TabsContent>
        <TabsContent value="customs"><CustomsPanel shipmentId={id} shipment={shipment} mayEdit={mayEdit} /></TabsContent>
        <TabsContent value="dispatch"><DispatchPanel shipmentId={id} mayEdit={mayEdit} mayApprove={mayApprove} /></TabsContent>
        <TabsContent value="hs"><HsPanel shipment={shipment} /></TabsContent>
      </Tabs>
    </main>
  );
}
