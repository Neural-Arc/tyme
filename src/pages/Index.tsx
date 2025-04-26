import { Chat } from "@/components/Chat";
import { Settings } from "@/components/Settings";
import { TimeZoneDisplay } from "@/components/TimeZoneDisplay";
const Index = () => {
  return <div className="bg-black">
      <Settings />
      
      <main className="container max-w-3xl mx-auto">
        <div className="space-y-8">
          <Chat />
          <TimeZoneDisplay />
        </div>
      </main>
    </div>;
};
export default Index;