
import { Chat } from "@/components/Chat";
import { Settings } from "@/components/Settings";
import { TimeZoneDisplay } from "@/components/TimeZoneDisplay";

const Index = () => {
  return (
    <div className="min-h-screen p-4 relative bg-gradient-to-br from-[#3dd68c]/20 to-[#3dd68c]/5">
      <Settings />
      
      <main className="container max-w-3xl mx-auto">
        <div className="space-y-8">
          <Chat />
          <TimeZoneDisplay />
        </div>
      </main>
    </div>
  );
};

export default Index;
