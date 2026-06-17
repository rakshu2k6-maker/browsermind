import { useGetTask, usePauseTask, useResumeTask, useStopTask, useExecuteTask, getGetTaskQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, Pause, Play, Square, AlertCircle, CheckCircle2, ChevronRight, Activity, ArrowLeft, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ExecutionMonitor() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: task, isLoading } = useGetTask(id, { 
    query: { 
      refetchInterval: (query) => {
        // Poll every 2 seconds if task is running
        return query.state.data?.status === "running" ? 2000 : false;
      }
    } 
  });

  const pauseTask = usePauseTask();
  const resumeTask = useResumeTask();
  const stopTask = useStopTask();
  const executeTask = useExecuteTask();

  useEffect(() => {
    if (task?.status === "completed" || task?.status === "failed") {
      setLocation(`/tasks/${id}/results`);
    }
  }, [task?.status, id, setLocation]);

  useEffect(() => {
    // Auto-scroll to bottom of logs
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [task?.steps]);

  if (isLoading || !task) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin text-primary">
          <RefreshCw className="w-8 h-8" />
        </div>
      </div>
    );
  }

  const handleAction = (action: 'pause' | 'resume' | 'stop' | 'execute') => {
    const mutationMap = { pause: pauseTask, resume: resumeTask, stop: stopTask, execute: executeTask };
    const mutation = mutationMap[action];
    
    mutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(id) });
        toast({ title: `Task ${action}d` });
      },
      onError: (err) => {
        toast({ title: `Failed to ${action} task`, description: err.error, variant: "destructive" });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20 animate-pulse"><Activity className="w-3 h-3 mr-1" /> RUNNING</Badge>;
      case 'pending': return <Badge variant="secondary" className="text-muted-foreground"><Clock className="w-3 h-3 mr-1" /> PENDING</Badge>;
      case 'paused': return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20"><Pause className="w-3 h-3 mr-1" /> PAUSED</Badge>;
      case 'completed': return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> COMPLETED</Badge>;
      case 'failed': return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> FAILED</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-3 text-muted-foreground" onClick={() => setLocation('/tasks')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tasks
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-mono font-bold tracking-tight">{task.title || `Task #${task.id}`}</h1>
            {getStatusBadge(task.status)}
          </div>
          <p className="text-muted-foreground mt-1 font-mono text-sm max-w-2xl truncate">{task.instruction}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {task.status === 'pending' && (
            <Button onClick={() => handleAction('execute')} disabled={executeTask.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Play className="w-4 h-4 mr-2" /> Start Now
            </Button>
          )}
          {task.status === 'running' && (
            <>
              <Button onClick={() => handleAction('pause')} disabled={pauseTask.isPending} variant="outline" className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10">
                <Pause className="w-4 h-4 mr-2" /> Pause
              </Button>
              <Button onClick={() => handleAction('stop')} disabled={stopTask.isPending} variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                <Square className="w-4 h-4 mr-2" /> Stop
              </Button>
            </>
          )}
          {task.status === 'paused' && (
            <>
              <Button onClick={() => handleAction('resume')} disabled={resumeTask.isPending} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Play className="w-4 h-4 mr-2" /> Resume
              </Button>
              <Button onClick={() => handleAction('stop')} disabled={stopTask.isPending} variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                <Square className="w-4 h-4 mr-2" /> Stop
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border bg-[#0c1015] shadow-lg overflow-hidden flex flex-col h-[600px]">
            <CardHeader className="bg-muted/10 border-b border-border/50 py-3 px-4 flex flex-row items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-mono text-foreground/80 uppercase tracking-widest">Live Action Log</CardTitle>
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                Step {task.stepCount || 0}
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden relative">
              <ScrollArea className="h-full w-full" ref={scrollRef}>
                <div className="p-4 font-mono text-sm space-y-3">
                  {task.steps?.length === 0 ? (
                    <div className="text-muted-foreground/50 text-center py-10 italic">Waiting for agent to initialize...</div>
                  ) : (
                    task.steps?.map((step) => (
                      <div key={step.id} className="flex flex-col gap-1 border-b border-border/20 pb-3 last:border-0 animate-in slide-in-from-left-2">
                        <div className="flex items-start gap-3">
                          <span className="text-muted-foreground min-w-[20px] text-right opacity-50">{step.stepNumber}</span>
                          <span className={`font-bold uppercase tracking-wider ${
                            step.action === 'click' ? 'text-blue-400' :
                            step.action === 'type' ? 'text-emerald-400' :
                            step.action === 'navigate' ? 'text-purple-400' :
                            'text-primary'
                          }`}>
                            {step.action}
                          </span>
                          <span className="text-foreground/80 break-all">{step.target || step.input}</span>
                          {step.status === 'failed' && <AlertCircle className="w-4 h-4 text-destructive ml-auto shrink-0" />}
                        </div>
                        {step.reasoning && (
                          <div className="ml-8 text-muted-foreground/70 text-xs border-l-2 border-primary/20 pl-2 py-0.5">
                            <span className="text-primary/40 mr-1">↳</span>{step.reasoning}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {task.status === 'running' && (
                    <div className="flex items-center gap-2 text-primary/70 ml-8 animate-pulse pt-2">
                      <div className="w-1.5 h-4 bg-primary/70"></div>
                      <span className="text-xs italic">Agent is thinking...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Extracted Data Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {task.extractedData ? (
                <div className="bg-[#0c1015] p-3 rounded-md font-mono text-xs text-emerald-400/90 overflow-auto max-h-[300px] border border-border">
                  <pre>{task.extractedData}</pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50 border border-dashed border-border/50 rounded-md">
                  <Terminal className="w-8 h-8 mb-2 opacity-20" />
                  <span className="text-sm">No data extracted yet</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Need a simple Clock icon
function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}