
import { Chat } from "@/components/Chat";
import { Settings } from "@/components/Settings";
import { TimeZoneDisplay } from "@/components/TimeZoneDisplay";

const Index = () => {
  return (
    <div className="min-h-screen p-4 relative">
      <Settings />
      
      <main className="container max-w-4xl mx-auto pt-16 space-y-12">
        <Chat />
        <TimeZoneDisplay />
      </main>
    </div>
  );
};

export default Index;
