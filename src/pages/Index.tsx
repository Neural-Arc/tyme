
import { Chat } from "@/components/Chat";
import { TimeZoneDisplay } from "@/components/TimeZoneDisplay";

const Index = () => {
  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <main className="container mx-auto p-4 w-full">
        <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-3xl mx-auto initial-load">
          <Chat />
          <TimeZoneDisplay />
        </div>
      </main>
    </div>
  );
};

export default Index;
