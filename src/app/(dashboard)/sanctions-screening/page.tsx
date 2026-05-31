'use client';

import { useState } from 'react';
import {
  screenSanctions,
  type SanctionsScreenResult,
  type SanctionsScreenInput,
} from '@/lib/sanctions-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ShieldCheck,
  ShieldAlert,
  Ban,
  Loader2,
  Search,
  RefreshCw,
  AlertTriangle,
  Globe,
} from 'lucide-react';

export default function SanctionsScreeningPage() {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SanctionsScreenResult | null>(null);
  // Remember the last submitted query so "Retry" re-runs the exact same screen.
  const [lastQuery, setLastQuery] = useState<SanctionsScreenInput | null>(null);

  async function runScreen(query: SanctionsScreenInput) {
    setLoading(true);
    setError(null);
    setResult(null);
    setLastQuery(query);
    try {
      const res = await screenSanctions(query);
      setResult(res);
    } catch (e: any) {
      setError(e?.message || 'Screening failed. Please retry.');
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    runScreen({ name, country });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Sanctions Screening
        </h1>
        <p className="text-sm text-muted-foreground">
          Screen a counterparty against global sanctions watchlists (OFAC SDN, UN, EU) before transacting.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Screen an entity</CardTitle>
          <CardDescription>Enter a name (and optionally a country) to check for sanctions matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entity-name">Entity name</Label>
              <Input
                id="entity-name"
                placeholder="e.g. Vladimir Putin, Wagner Group"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity-country">
                Country <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="entity-country"
                placeholder="e.g. Russia"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>
            <Button type="submit" disabled={loading || !name.trim()} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking…
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Check Risk
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Checking global sanctions databases…
        </div>
      )}

      {/* Error state + retry */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Screening failed</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => lastQuery && runScreen(lastQuery)}
              disabled={!lastQuery}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-2">
          <ResultPanel result={result} />
          {result.sourcesChecked && result.sourcesChecked.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Sources checked: {result.sourcesChecked.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ResultPanel({ result }: { result: SanctionsScreenResult }) {
  const confidencePct = `${Math.round((result.confidence ?? 0) * 100)}%`;

  if (result.status === 'CLEAR') {
    return (
      <Card className="border-green-600/40">
        <CardContent className="flex items-center gap-3 p-6">
          <ShieldCheck className="h-8 w-8 text-green-600" />
          <div>
            <Badge variant="success" className="mb-1">CLEAR</Badge>
            <p className="font-medium">No match found</p>
            <p className="text-sm text-muted-foreground">
              No sanctions list entry matched at the confidence threshold.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.status === 'POTENTIAL_MATCH') {
    return (
      <Card className="border-yellow-500/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-yellow-500" />
            <div>
              <Badge variant="warning" className="mb-1">POTENTIAL MATCH</Badge>
              <CardTitle className="text-lg">Possible sanctions match — review required</CardTitle>
              <CardDescription>Top confidence {confidencePct}. Review before proceeding.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MatchList result={result} />
        </CardContent>
      </Card>
    );
  }

  // CONFIRMED_MATCH
  return (
    <Card className="border-destructive/60 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Ban className="h-7 w-7 text-destructive" />
          <div>
            <Badge variant="destructive" className="mb-1">CONFIRMED MATCH — BLOCKED</Badge>
            <CardTitle className="text-lg text-destructive">Sanctions match confirmed</CardTitle>
            <CardDescription>
              Top confidence {confidencePct}. Do not transact — escalate to compliance.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <MatchList result={result} highlightProgram />
      </CardContent>
    </Card>
  );
}

function MatchList({ result, highlightProgram = false }: { result: SanctionsScreenResult; highlightProgram?: boolean }) {
  if (!result.matches.length) {
    return <p className="text-sm text-muted-foreground">No match detail returned.</p>;
  }
  return (
    <ul className="divide-y rounded-md border">
      {result.matches.map((m, i) => (
        <li key={`${m.name}-${i}`} className="flex flex-wrap items-center justify-between gap-2 p-3">
          <div>
            <p className="font-medium">{m.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" /> {m.source}
              {typeof m.sourceConfidence === 'number' && (
                <span className="ml-1">· confidence {Math.round(m.sourceConfidence * 100)}%</span>
              )}
            </p>
          </div>
          {m.program && (
            <Badge variant={highlightProgram ? 'destructive' : 'secondary'}>{m.program}</Badge>
          )}
        </li>
      ))}
    </ul>
  );
}
