import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, KeyRound, Save, Settings2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  anthropicApiKey: z.string().optional(),
  defaultTimeout: z.coerce.number().min(10).max(600),
  autoRetry: z.boolean(),
  screenshotFrequency: z.string(),
  defaultOutputFormat: z.string(),
});

export default function Settings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      anthropicApiKey: "",
      defaultTimeout: 60,
      autoRetry: false,
      screenshotFrequency: "on_action",
      defaultOutputFormat: "JSON",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        anthropicApiKey: settings.anthropicApiKey || "",
        defaultTimeout: settings.defaultTimeout,
        autoRetry: settings.autoRetry,
        screenshotFrequency: settings.screenshotFrequency,
        defaultOutputFormat: settings.defaultOutputFormat,
      });
    }
  }, [settings, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Only send API key if it's not the masked version and not empty
    const payload = { ...values };
    if (payload.anthropicApiKey === "••••••••••••••••••••••••••••••••" || !payload.anthropicApiKey) {
      delete payload.anthropicApiKey;
    }

    updateSettings.mutate({ data: payload }, {
      onSuccess: () => {
        toast({ title: "Settings updated successfully" });
      },
      onError: (err) => {
        toast({ title: "Failed to update settings", description: err.error, variant: "destructive" });
      }
    });
  }

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading settings...</div>;

  const hasApiKey = settings?.anthropicApiKey && settings.anthropicApiKey !== "";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-tight mb-1">Configuration</h1>
        <p className="text-muted-foreground">Manage agent behavior and credentials.</p>
      </div>

      {!hasApiKey && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">Missing API Key</AlertTitle>
          <AlertDescription>
            Configure your Anthropic API key to enable live AI execution. Tasks will remain pending until configured.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <Card className="border-border">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="w-5 h-5 text-primary" />
                Provider Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="anthropicApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anthropic API Key</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={hasApiKey ? "••••••••••••••••••••••••••••••••" : "sk-ant-..."} 
                        className="font-mono bg-background"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Required for the browser agent to function. Stored securely.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5 text-primary" />
                Agent Defaults
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="defaultTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Timeout (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultOutputFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Output Format</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                 <FormField
                  control={form.control}
                  name="screenshotFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Screenshot Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="always">Always (Every Step)</SelectItem>
                          <SelectItem value="on_action">On Actions</SelectItem>
                          <SelectItem value="on_error">Only on Error</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="autoRetry"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-background">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto Retry</FormLabel>
                        <FormDescription>
                          Automatically retry failed steps
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 p-4 bg-muted/5 flex justify-end">
              <Button type="submit" disabled={updateSettings.isPending} className="bg-primary text-primary-foreground">
                <Save className="w-4 h-4 mr-2" />
                {updateSettings.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </CardFooter>
          </Card>

        </form>
      </Form>
    </div>
  );
}
