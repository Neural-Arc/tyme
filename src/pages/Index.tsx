
import { Chat } from "@/components/Chat";
import { Settings } from "@/components/Settings";
import { TimeZoneCard } from "@/components/TimeZoneCard";

const Index = () => {
  return (
    <div className="min-h-screen p-4 relative">
      <Settings />
      
      <main className="container max-w-4xl mx-auto pt-16 space-y-12">
        <Chat />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TimeZoneCard
            city="San Francisco"
            currentTime="9:41 AM PDT"
          />
          <TimeZoneCard
            city="London"
            currentTime="5:41 PM BST"
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
