
import { Chat } from "@/components/Chat";
import { Settings } from "@/components/Settings";
import { TimeZoneDisplay } from "@/components/TimeZoneDisplay";

const Index = () => {
  return (
    <div className="bg-black min-h-screen">
      <Settings />
      <main className="center-layout container mx-auto p-4">
        <div className="space-y-8 w-full max-w-3xl">
          <Chat />
          <TimeZoneDisplay />
        </div>
      </main>
    </div>
  );
};

export default Index;
