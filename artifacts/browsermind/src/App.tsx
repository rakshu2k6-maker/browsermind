import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

import Dashboard from "@/pages/dashboard";
import TaskCreator from "@/pages/task-creator";
import ExecutionMonitor from "@/pages/execution-monitor";
import TaskResults from "@/pages/task-results";
import TaskHistory from "@/pages/task-history";
import Templates from "@/pages/templates";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tasks/new" component={TaskCreator} />
        <Route path="/tasks/:id/monitor" component={ExecutionMonitor} />
        <Route path="/tasks/:id/results" component={TaskResults} />
        <Route path="/tasks" component={TaskHistory} />
        <Route path="/templates" component={Templates} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="browsermind-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
