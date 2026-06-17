import { useListTemplates, useDeleteTemplate, useExecuteTemplate } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Copy, Trash2, Library, Globe } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Templates() {
  const { data: templates, isLoading } = useListTemplates();
  const deleteTemplate = useDeleteTemplate();
  const executeTemplate = useExecuteTemplate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDelete = (id: number) => {
    if (!confirm("Delete this template?")) return;
    deleteTemplate.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
        toast({ title: "Template deleted" });
      }
    });
  };

  const handleExecute = (id: number) => {
    executeTemplate.mutate({ id }, {
      onSuccess: (task) => {
        toast({ title: "Task created from template", description: "Spinning up agent..." });
        setLocation(`/tasks/${task.id}/monitor`);
      },
      onError: (err) => {
        toast({ title: "Failed to run template", description: err.error, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-tight mb-1">Templates Library</h1>
        <p className="text-muted-foreground">Saved task configurations for one-click execution.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse bg-muted/20 border-border h-[200px]"></Card>
          ))}
        </div>
      ) : !templates?.length ? (
        <Card className="p-16 border-dashed flex flex-col items-center justify-center text-center bg-transparent">
          <Library className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">No templates yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-2">
            Save successful tasks as templates from the Task Results page to build your automation library.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="border-border bg-card shadow-sm hover:shadow-md transition-all group flex flex-col">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="flex items-start justify-between">
                  <span className="text-lg font-bold truncate">{template.name}</span>
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground whitespace-nowrap">
                    {template.timesUsed} runs
                  </span>
                </CardTitle>
                {template.targetUrl && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Globe className="w-3 h-3 mr-1" />
                    <span className="truncate">{template.targetUrl}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 flex-1">
                <div className="text-sm text-foreground/80 line-clamp-4 font-mono leading-relaxed bg-[#0c1015] p-3 rounded-md border border-border">
                  {template.instruction}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button onClick={() => handleExecute(template.id)} disabled={executeTemplate.isPending} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Play className="w-4 h-4 mr-2" /> Run
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(template.id)} className="shrink-0 border-destructive/20 text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
