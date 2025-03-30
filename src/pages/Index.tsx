
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

const Index = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const handleTopicSelected = (topic: Topic) => {
    setSelectedTopic(topic);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tweet Tribune Dashboard</h1>
        
        <TrendingTopicsList onTopicSelected={handleTopicSelected} />
        
        <TweetGenerator selectedTopic={selectedTopic} />
      </div>
    </MainLayout>
  );
};

export default Index;
