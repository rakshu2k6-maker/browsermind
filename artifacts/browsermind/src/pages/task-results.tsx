import { useGetTask, useCreateTemplate } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, ArrowLeft, Download, RotateCcw, Copy, TerminalSquare, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TaskResults() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const { data: task, isLoading } = useGetTask(id);
  const createTemplate = useCreateTemplate();

  if (isLoading || !task) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading results...</div>;
  }

  const handleDownload = () => {
    if (!task.extractedData) return;
    const blob = new Blob([task.extractedData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `browsermind-task-${id}-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveTemplate = () => {
    createTemplate.mutate({
      data: {
        name: task.title || `Template from Task #${id}`,
        instruction: task.instruction,
        targetUrl: task.targetUrl || undefined,
        outputFormat: task.outputFormat
      }
    }, {
      onSuccess: () => {
        toast({ title: "Template saved successfully" });
      },
      onError: (err) => {
        toast({ title: "Failed to save template", description: err.error, variant: "destructive" });
      }
    });
  };

  const isSuccess = task.status === 'completed';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-3 text-muted-foreground" onClick={() => setLocation('/tasks')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tasks
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-mono font-bold tracking-tight">Execution Results</h1>
            {isSuccess ? (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1"><CheckCircle2 className="w-4 h-4 mr-1.5" /> SUCCESS</Badge>
            ) : (
              <Badge variant="destructive" className="px-3 py-1"><AlertCircle className="w-4 h-4 mr-1.5" /> FAILED</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 font-mono text-sm max-w-2xl truncate">{task.instruction}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleSaveTemplate} disabled={createTemplate.isPending} variant="outline" className="border-border">
            <Copy className="w-4 h-4 mr-2" /> Save Template
          </Button>
          <Button onClick={() => setLocation('/tasks/new')} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <RotateCcw className="w-4 h-4 mr-2" /> Run Again
          </Button>
        </div>
      </div>

      {!isSuccess && task.errorMessage && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4 flex gap-3 items-start text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold mb-1">Execution Failed</h3>
              <p className="text-sm opacity-90">{task.errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Time Elapsed</div>
            <div className="text-2xl font-bold font-mono text-foreground">{task.executionTime || 0}s</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Steps Taken</div>
            <div className="text-2xl font-bold font-mono text-foreground">{task.stepCount || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50 md:col-span-2">
          <CardContent className="p-4 flex justify-between items-center h-full">
            <div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Status</div>
              <div className="text-xl font-bold font-mono text-foreground capitalize">{task.status}</div>
            </div>
            {task.extractedData && (
              <Button size="sm" onClick={handleDownload} className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30">
                <Download className="w-4 h-4 mr-2" /> Export Data
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-md overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 py-3">
          <CardTitle className="text-sm font-mono text-foreground/80 uppercase tracking-widest flex justify-between items-center">
            Extracted Data
            <Badge variant="outline" className="text-[10px] font-mono">{task.outputFormat || 'JSON'}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {task.extractedData ? (
             <div className="bg-[#0c1015] p-6 font-mono text-sm text-emerald-400/90 overflow-auto max-h-[500px]">
              <pre>{task.extractedData}</pre>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground border-t border-border/50">
              <TerminalSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No data was extracted during this execution.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Collapsible open={transcriptOpen} onOpenChange={setTranscriptOpen} className="border border-border rounded-lg bg-card">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-colors">
            <h3 className="font-mono text-sm uppercase tracking-wider font-semibold">Raw Execution Transcript</h3>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              {transcriptOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border bg-[#0c1015] p-4 font-mono text-xs text-muted-foreground whitespace-pre-wrap max-h-[400px] overflow-auto">
            {task.transcript || "No transcript available."}
          </div>
        </CollapsibleContent>
      </Collapsible>

    </div>
  );
}
