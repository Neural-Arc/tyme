
import { Chat } from "@/components/Chat";
import { Settings } from "@/components/Settings";
import { TimeZoneDisplay } from "@/components/TimeZoneDisplay";

const Index = () => {
  return (
    <div className="min-h-screen p-4 relative bg-black">
      <Settings />
      
      <main className="container max-w-3xl mx-auto pt-12">
        <div className="space-y-8">
          <Chat />
          <TimeZoneDisplay />
        </div>
      </main>
    </div>
  );
};

export default Index;
