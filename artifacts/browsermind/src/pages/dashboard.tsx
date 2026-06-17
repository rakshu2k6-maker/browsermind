import { useGetStatsSummary, useGetRecentTasks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Activity, CheckCircle2, Clock, XCircle, Play, ArrowRight, BrainCircuit, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();
  const { data: recentTasks, isLoading: tasksLoading } = useGetRecentTasks();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Overview of agent activity and performance.</p>
        </div>
        <Link href="/tasks/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
          <Play className="w-4 h-4" />
          Start New Task
        </Link>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse bg-muted/20 border-border">
              <CardHeader className="h-24"></CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit className="w-16 h-16 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono font-normal text-muted-foreground uppercase tracking-wider">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stats?.totalTasks || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Lifetime executions</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono font-normal text-muted-foreground uppercase tracking-wider">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-emerald-400">
                {stats?.successRate ? `${Math.round(stats.successRate * 100)}%` : '0%'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stats?.completedTasks || 0} successful tasks</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <XCircle className="w-16 h-16 text-destructive" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono font-normal text-muted-foreground uppercase tracking-wider">Failed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-destructive">{stats?.failedTasks || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Require attention</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock className="w-16 h-16 text-blue-500" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono font-normal text-muted-foreground uppercase tracking-wider">Avg Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-blue-400">{stats?.avgExecutionTime ? `${stats.avgExecutionTime}s` : '0s'}</div>
              <div className="text-xs text-muted-foreground mt-1">Per completed task</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-mono font-semibold tracking-tight">Recent Executions</h2>
          <Link href="/tasks" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {tasksLoading ? (
          <div className="space-y-3">
             {[1, 2, 3].map(i => (
              <Card key={i} className="h-16 animate-pulse bg-muted/20 border-border"></Card>
            ))}
          </div>
        ) : !recentTasks?.length ? (
          <Card className="p-12 border-dashed flex flex-col items-center justify-center text-center bg-transparent">
            <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No tasks yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-2 mb-6">
              BrowserMind hasn't executed any tasks yet. Create your first task to see the agent in action.
            </p>
            <Link href="/tasks/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              <Play className="w-4 h-4" />
              Quick Start
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden hover:bg-accent/50 transition-colors">
                <Link href={task.status === 'running' || task.status === 'pending' ? `/tasks/${task.id}/monitor` : `/tasks/${task.id}/results`} className="block">
                  <div className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{task.title || 'Untitled Task'}</span>
                        {task.status === 'completed' && <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</span>}
                        {task.status === 'running' && <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Running</span>}
                        {task.status === 'failed' && <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">Failed</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{task.instruction}</p>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {new Date(task.createdAt).toLocaleString()}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
