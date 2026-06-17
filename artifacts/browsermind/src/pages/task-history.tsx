import { useListTasks, useDeleteTask } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Play, Trash2, MoreHorizontal, Activity, CheckCircle2, AlertCircle, Pause, Clock } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export default function TaskHistory() {
  const [search, setSearch] = useState("");
  const { data: tasks, isLoading } = useListTasks({ search: search || undefined });
  const deleteTask = useDeleteTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    deleteTask.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        toast({ title: "Task deleted" });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20"><Activity className="w-3 h-3 mr-1" /> RUNNING</Badge>;
      case 'pending': return <Badge variant="secondary" className="text-muted-foreground"><Clock className="w-3 h-3 mr-1" /> PENDING</Badge>;
      case 'paused': return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Pause className="w-3 h-3 mr-1" /> PAUSED</Badge>;
      case 'completed': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> COMPLETED</Badge>;
      case 'failed': return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> FAILED</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight mb-1">Task History</h1>
          <p className="text-muted-foreground">Review and manage past executions.</p>
        </div>
        <Link href="/tasks/new" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
          <Play className="w-4 h-4" />
          New Task
        </Link>
      </div>

      <Card className="border-border">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search instructions or titles..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading tasks...</div>
          ) : !tasks?.length ? (
            <div className="p-16 text-center">
              <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or create a new task.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono text-xs uppercase tracking-wider">ID / Title</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider">Instruction</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider">Created</TableHead>
                  <TableHead className="text-right font-mono text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="border-border group">
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[150px]">{task.title || `Task #${task.id}`}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground text-sm truncate max-w-[300px]" title={task.instruction}>
                        {task.instruction}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(task.status)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem asChild>
                            <Link href={task.status === 'running' || task.status === 'pending' ? `/tasks/${task.id}/monitor` : `/tasks/${task.id}/results`} className="cursor-pointer flex items-center w-full">
                              <Activity className="w-4 h-4 mr-2" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer" onClick={() => handleDelete(task.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
