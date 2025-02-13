import { useQuery } from "@tanstack/react-query";
import type { Task } from "@shared/schema";
import TaskItem from "./task-item";
import { Card, CardContent } from "@/components/ui/card";

interface TaskListProps {
  filter: "all" | "fixed" | "variable";
}

export default function TaskList({ filter }: TaskListProps) {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks?.length) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          No tasks found
        </CardContent>
      </Card>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "fixed") return task.isFixed;
    return !task.isFixed;
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
