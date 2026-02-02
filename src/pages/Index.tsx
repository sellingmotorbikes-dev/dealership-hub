import { SmartQueueWidget, PipelineSummary, TodayActivities, RecentActivity } from '@/components/dashboard';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welkom terug, {user?.name}
        </p>
      </div>

      {/* Smart Queue - Top Priority */}
      <SmartQueueWidget />

      {/* Grid of other widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PipelineSummary />
        <TodayActivities />
        <RecentActivity />
      </div>
    </div>
  );
};

export default Index;
