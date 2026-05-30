
'use client';

import { useAppState, DemoScenario } from './app-state';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Play, 
  Square, 
  GraduationCap, 
  ShieldAlert, 
  Clock, 
  Gavel, 
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

export function DemoControl() {
  const { isDemoMode, setDemoMode, startTour, isTourActive, activeScenario, triggerScenario } = useAppState();
  const { toast } = useToast();

  const handleScenario = async (scenario: DemoScenario) => {
    await triggerScenario(scenario);
    toast({
      title: "Scenario Injected",
      description: `Platform state has been updated to simulate: ${scenario.replace('_', ' ').toUpperCase()}`,
    });
  };

  const scenarios: { id: DemoScenario; label: string; icon: any; color: string }[] = [
    { id: 'dispute', label: 'Trade Dispute', icon: Gavel, color: 'text-orange-600' },
    { id: 'delay', label: 'Corridor Delay', icon: Clock, color: 'text-blue-600' },
    { id: 'high_risk', label: 'Sanctions Hit', icon: ShieldAlert, color: 'text-red-600' },
    { id: 'none', label: 'Restore Normalcy', icon: CheckCircle2, color: 'text-green-600' },
  ];

  return (
    <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-full border border-primary/10 shadow-sm animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-2 pl-3">
        {isDemoMode ? (
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
        ) : (
          <Zap className="h-3 w-3 text-muted-foreground opacity-40" />
        )}
        <span className={cn(
          "text-[10px] font-black uppercase tracking-[0.15em]",
          isDemoMode ? "text-primary" : "text-muted-foreground"
        )}>
          {isDemoMode ? 'Simulation Active' : 'Simulation Idle'}
        </span>
      </div>
      
      <div className="flex items-center gap-1 pr-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              variant="ghost"
              className="h-8 rounded-full px-4 text-[10px] font-black uppercase tracking-widest"
            >
              <Zap className="mr-2 h-3.5 w-3.5 text-primary" />
              Scenarios
              <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-[10px] font-black uppercase opacity-60">Inject Disruption</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {scenarios.map((s) => (
              <DropdownMenuItem 
                key={s.id} 
                onClick={() => handleScenario(s.id)}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <s.icon className={cn("h-4 w-4", s.color)} />
                <span className="text-xs font-bold">{s.label}</span>
                {activeScenario === s.id && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          size="sm" 
          variant={isTourActive ? "secondary" : "ghost"}
          className="h-8 rounded-full px-4 text-[10px] font-black uppercase tracking-widest"
          onClick={startTour}
          disabled={isTourActive}
        >
          <GraduationCap className="mr-2 h-3.5 w-3.5" />
          Guided Tour
        </Button>

        <Button 
          size="sm" 
          variant={isDemoMode ? "destructive" : "default"}
          className="h-8 rounded-full px-4 text-[10px] font-black uppercase tracking-widest shadow-md"
          onClick={() => setDemoMode(!isDemoMode)}
        >
          {isDemoMode ? (
            <>
              <Square className="mr-2 h-3 w-3 fill-current" />
              Stop
            </>
          ) : (
            <>
              <Play className="mr-2 h-3 w-3 fill-current" />
              Run Demo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
