import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useCreateTask } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Play, Settings2, TerminalSquare } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  instruction: z.string().min(1, "Instruction is required"),
  title: z.string().optional(),
  targetUrl: z.string().url().optional().or(z.literal("")),
  outputFormat: z.string().optional(),
  maxRetries: z.coerce.number().min(0).max(5).default(3),
  timeoutSeconds: z.coerce.number().min(10).max(300).default(60),
});

export default function TaskCreator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createTask = useCreateTask();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instruction: "",
      title: "",
      targetUrl: "",
      outputFormat: "JSON",
      maxRetries: 3,
      timeoutSeconds: 60,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createTask.mutate({
      data: {
        instruction: values.instruction,
        title: values.title || undefined,
        targetUrl: values.targetUrl || undefined,
        outputFormat: values.outputFormat,
        maxRetries: values.maxRetries,
        timeoutSeconds: values.timeoutSeconds,
      }
    }, {
      onSuccess: (data) => {
        toast({
          title: "Task created successfully",
          description: "Agent is spinning up...",
        });
        setLocation(`/tasks/${data.id}/monitor`);
      },
      onError: (error) => {
        toast({
          title: "Failed to create task",
          description: error.error || "An unknown error occurred",
          variant: "destructive"
        });
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-tight mb-1">New Task</h1>
        <p className="text-muted-foreground">Instruct the agent on what to do.</p>
      </div>

      <Card className="border-border shadow-lg">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <TerminalSquare className="w-5 h-5 text-primary" />
            Agent Directives
          </CardTitle>
          <CardDescription>
            Provide clear, step-by-step instructions. The agent will interpret these and execute browser actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="instruction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/90 font-mono text-sm uppercase tracking-wide">Instruction Prompt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. Go to news.ycombinator.com, extract the top 10 articles including title, points, and submitter, and format as JSON." 
                        className="min-h-[150px] font-mono text-sm resize-y bg-background" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Hacker News Scrape" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://news.ycombinator.com" type="url" {...field} />
                      </FormControl>
                      <FormDescription>Where the agent should start</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Accordion type="single" collapsible className="w-full border rounded-md border-border/50">
                <AccordionItem value="advanced" className="border-b-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/20 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-muted-foreground" />
                      Advanced Settings
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="outputFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Output Format</FormLabel>
                            <FormControl>
                              <Input placeholder="JSON" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxRetries"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Retries</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} max={10} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="timeoutSeconds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeout (s)</FormLabel>
                            <FormControl>
                              <Input type="number" min={10} max={600} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={createTask.isPending}
                  className="font-mono uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(20,184,100,0.3)] hover:shadow-[0_0_25px_rgba(20,184,100,0.5)] transition-all"
                >
                  {createTask.isPending ? "Initializing..." : (
                    <><Play className="w-4 h-4 mr-2" /> Start Agent</>
                  )}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
