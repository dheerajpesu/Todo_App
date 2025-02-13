import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateTask from "@/components/tasks/create-task";
import TaskList from "@/components/tasks/task-list";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Daily Task Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateTask />
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="fixed">Fixed Tasks</TabsTrigger>
            <TabsTrigger value="variable">Variable Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <TaskList filter="all" />
          </TabsContent>
          <TabsContent value="fixed">
            <TaskList filter="fixed" />
          </TabsContent>
          <TabsContent value="variable">
            <TaskList filter="variable" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
