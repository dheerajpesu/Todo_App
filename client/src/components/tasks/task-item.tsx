import { useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { toast } = useToast();

  const toggleMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/tasks/${task.id}`, {
        completed: !task.completed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleMutation.mutate()}
          disabled={toggleMutation.isPending}
        />
        <div className="flex flex-col gap-1">
          <span className={task.completed ? "line-through text-muted-foreground" : ""}>
            {task.title}
          </span>
          <Badge variant={task.isFixed ? "default" : "secondary"} className="w-fit">
            {task.isFixed ? "Fixed" : "Variable"}
          </Badge>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => deleteMutation.mutate()}
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
