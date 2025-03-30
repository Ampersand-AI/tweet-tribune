
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import TrendingTopicsList from "@/components/trending/TrendingTopicsList";
import TweetGenerator from "@/components/tweet/TweetGenerator";

interface Topic {
  id: string;
  title: string;
  description: string;
  source: "twitter" | "linkedin";
}

// Create a custom event to share generated tweets with other components
export const sendGeneratedTweetsToSchedule = (tweets: any[]) => {
  // Store tweets in local storage for Schedule page to access
  localStorage.setItem("generated-tweets", JSON.stringify(tweets));
  
  // Dispatch a custom event to notify other components
  window.dispatchEvent(new CustomEvent('tweetsGenerated', { detail: tweets }));
};

const Index = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const handleTopicSelected = (topic: Topic) => {
    console.log("Selected topic:", topic);
    setSelectedTopic(topic);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tweet Tribune Dashboard</h1>
        
        <TrendingTopicsList onTopicSelected={handleTopicSelected} />
        
        {selectedTopic && <TweetGenerator selectedTopic={selectedTopic} />}
      </div>
    </MainLayout>
  );
};

export default Index;
