
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import TrendingTopicsList from "@/components/trending/TrendingTopicsList";
import TweetGenerator from "@/components/tweet/TweetGenerator";

const Index = () => {
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tweet Tribune Dashboard</h1>
        
        <TrendingTopicsList onTopicSelected={setSelectedTopic} />
        
        <TweetGenerator selectedTopic={selectedTopic} />
      </div>
    </MainLayout>
  );
};

export default Index;
