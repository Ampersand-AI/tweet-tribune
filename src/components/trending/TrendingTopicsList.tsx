
import { useState } from "react";
import TrendingTopicCard from "./TrendingTopicCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data for trending topics
const MOCK_TRENDING_TOPICS = [
  {
    id: "1",
    title: "AI in Healthcare",
    description: "Discussions around artificial intelligence applications in healthcare and medical research.",
    source: "linkedin" as const,
  },
  {
    id: "2",
    title: "#AIStartups",
    description: "Trending hashtag about AI startups raising funding and new innovations in the space.",
    source: "twitter" as const,
  },
  {
    id: "3",
    title: "MicroSaaS Revenue Models",
    description: "Conversations about different revenue approaches for micro-SaaS businesses.",
    source: "linkedin" as const,
  },
  {
    id: "4",
    title: "#TechLayoffs",
    description: "Discussions about recent layoffs in the technology industry and their impact.",
    source: "twitter" as const,
  },
  {
    id: "5",
    title: "Remote Work Productivity",
    description: "Trending topic about maintaining and measuring productivity in remote work environments.",
    source: "linkedin" as const,
  },
  {
    id: "6",
    title: "#Web3Development",
    description: "Developers discussing latest techniques and frameworks for Web3 application development.",
    source: "twitter" as const,
  },
];

interface TrendingTopicsListProps {
  onTopicSelected: (topic: any) => void;
}

const TrendingTopicsList = ({ onTopicSelected }: TrendingTopicsListProps) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [topics, setTopics] = useState(MOCK_TRENDING_TOPICS);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call to refresh topics
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleTopicSelect = (id: string) => {
    setSelectedTopicId(id);
    const selectedTopic = topics.find(topic => topic.id === id);
    if (selectedTopic) {
      onTopicSelected(selectedTopic);
    }
  };

  const handleCustomTopicSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Add custom topic to the list
    const newTopic = {
      id: `custom-${Date.now()}`,
      title: searchTerm,
      description: `Custom topic added by user: ${searchTerm}`,
      source: "twitter" as const,
    };
    
    setTopics([newTopic, ...topics]);
    setSearchTerm("");
  };

  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trending Topics</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <form onSubmit={handleCustomTopicSearch} className="flex gap-2">
        <Input
          placeholder="Search or add custom topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Add</Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredTopics.map((topic) => (
          <TrendingTopicCard
            key={topic.id}
            id={topic.id}
            title={topic.title}
            description={topic.description}
            source={topic.source}
            isSelected={selectedTopicId === topic.id}
            onSelect={handleTopicSelect}
          />
        ))}
      </div>
      
      {filteredTopics.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No topics found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default TrendingTopicsList;
