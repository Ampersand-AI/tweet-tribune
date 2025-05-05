import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Twitter, 
  Linkedin, 
  Sparkles, 
  Send, 
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  PenLine
} from "lucide-react";
import { toast } from "sonner";

const Post = () => {
  // State for post content
  const [postContent, setPostContent] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Platforms state
  const [postToTwitter, setPostToTwitter] = useState(true);
  const [postToLinkedIn, setPostToLinkedIn] = useState(true);

  // User preferences for AI generation
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [postType, setPostType] = useState("informative");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [creativity, setCreativity] = useState([0.7]); // Default to 0.7

  // Check for connected social accounts
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [linkedInConnected, setLinkedInConnected] = useState(false);

  useEffect(() => {
    // Check if user has connected Twitter and LinkedIn
    const twitterToken = localStorage.getItem("twitter_access_token");
    const linkedInToken = localStorage.getItem("linkedin_access_token");
    
    setTwitterConnected(!!twitterToken);
    setLinkedInConnected(!!linkedInToken);
  }, []);

  useEffect(() => {
    // Update character count when post content changes
    setCharCount(postContent.length);
  }, [postContent]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const generatePost = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic to generate content");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Here we'll simulate the Gemini API call - in production, you'd call the actual API
      // You would need to set up a backend endpoint that forwards to Google's Gemini API
      
      // Define the prompt based on user preferences
      const promptParams = {
        topic: topic,
        tone: tone,
        length: length,
        type: postType,
        includeHashtags: includeHashtags,
        includeEmojis: includeEmojis,
        creativity: creativity[0]
      };
      
      const prompt = `
        Create a ${length} ${postType} social media post about "${topic}".
        Tone: ${tone}
        ${includeHashtags ? 'Include relevant hashtags.' : 'No hashtags.'}
        ${includeEmojis ? 'Include appropriate emojis.' : 'No emojis.'}
        Creativity level: ${creativity[0] > 0.7 ? 'high' : creativity[0] > 0.4 ? 'medium' : 'low'}
        Character limit: ${postToTwitter ? '280 characters max' : '3000 characters max'}
      `;
      
      console.log("Generating post with prompt:", prompt);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response - in production this would come from Gemini API
      // Different mock responses based on the post type
      let generatedContent = "";
      
      if (postType === "informative") {
        generatedContent = `📊 The latest findings on ${topic} show promising results! Studies indicate a 27% improvement in outcomes when implemented correctly. ${includeHashtags ? '#Innovation #Research' : ''}`;
      } else if (postType === "promotional") {
        generatedContent = `✨ Excited to share our latest work on ${topic}! We've seen amazing results that we can't wait to share with you. Check out the link in bio for more details. ${includeHashtags ? '#Announcement #NewRelease' : ''}`;
      } else if (postType === "question") {
        generatedContent = `🤔 What are your thoughts on ${topic}? We're curious to hear your perspectives and experiences. Drop your insights below! ${includeHashtags ? '#Discussion #Feedback' : ''}`;
      } else {
        generatedContent = `Just had an incredible breakthrough with ${topic}. Sometimes the simplest solutions yield the best results! ${includeHashtags ? '#Insights #Learning' : ''}`;
      }
      
      // Adjust length based on user preference
      if (length === "short") {
        generatedContent = generatedContent.split(' ').slice(0, 15).join(' ');
      } else if (length === "long" && !postToTwitter) {
        generatedContent = `${generatedContent}\n\nWhen diving deeper into ${topic}, it's important to consider all angles. Our team has been working on this for months, and the insights we've gathered are truly remarkable. The implications for the industry are significant, and we're excited to be at the forefront of this innovation.\n\nWe'd love to hear your thoughts and experiences with ${topic}. What challenges have you faced? What solutions have worked for you?`;
      }
      
      // Remove emojis if specified
      if (!includeEmojis) {
        generatedContent = generatedContent.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
      }
      
      // Adjust tone
      if (tone === "formal") {
        generatedContent = generatedContent.replace(/!/g, '.');
        generatedContent = generatedContent.replace(/Excited to/g, 'We are pleased to');
      } else if (tone === "casual") {
        generatedContent = generatedContent.replace(/We are/g, "We're");
        generatedContent += " 👍";
      }
      
      setPostContent(generatedContent);
      toast.success("Post generated successfully!");
    } catch (error) {
      console.error("Error generating post:", error);
      toast.error("Failed to generate post content");
    } finally {
      setIsGenerating(false);
    }
  };

  const publishPost = async () => {
    if (!postContent.trim()) {
      toast.error("Please enter content for your post");
      return;
    }
    
    if (!postToTwitter && !postToLinkedIn) {
      toast.error("Please select at least one platform to post to");
      return;
    }
    
    setIsPosting(true);
    
    try {
      // Create FormData object for the image if there is one
      const formData = new FormData();
      formData.append("content", postContent);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }
      
      // Platforms to post to
      formData.append("platforms", JSON.stringify({
        twitter: postToTwitter,
        linkedin: postToLinkedIn
      }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success message
      let successMessage = "Posted successfully to ";
      if (postToTwitter && postToLinkedIn) {
        successMessage += "Twitter and LinkedIn!";
      } else if (postToTwitter) {
        successMessage += "Twitter!";
      } else {
        successMessage += "LinkedIn!";
      }
      
      toast.success(successMessage);
      
      // Clear form after successful post
      setPostContent("");
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error publishing post:", error);
      toast.error("Failed to publish post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="space-y-2">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-blue-600"
        >
          Create Post
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-600"
        >
          Create and publish content to your social media platforms
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main post editor */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Post Content</CardTitle>
              <CardDescription className="text-slate-600">
                Create your post manually or generate it with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="editor">
                <TabsList className="mb-4 bg-blue-50">
                  <TabsTrigger value="editor" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-600">
                    <PenLine className="h-4 w-4 mr-2" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-600">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Generator
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="editor">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="What would you like to share?"
                      className="min-h-32 text-slate-800 border-blue-100 focus-visible:ring-blue-500"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      <p className={`text-sm ${charCount > 280 && postToTwitter ? 'text-red-500' : 'text-slate-600'}`}>
                        {charCount} / {postToTwitter ? '280' : '3000'} characters
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => setPostContent("")}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="ai" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="topic" className="text-blue-600">Topic</Label>
                      <Input
                        id="topic"
                        placeholder="What's your post about?"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="text-slate-800 border-blue-100 focus-visible:ring-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tone" className="text-blue-600">Tone</Label>
                        <Select value={tone} onValueChange={setTone}>
                          <SelectTrigger id="tone" className="border-blue-100 text-slate-800">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="informative">Informative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="postType" className="text-blue-600">Post Type</Label>
                        <Select value={postType} onValueChange={setPostType}>
                          <SelectTrigger id="postType" className="border-blue-100 text-slate-800">
                            <SelectValue placeholder="Select post type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="informative">Informative</SelectItem>
                            <SelectItem value="promotional">Promotional</SelectItem>
                            <SelectItem value="question">Question</SelectItem>
                            <SelectItem value="story">Story</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="length" className="text-blue-600">Length</Label>
                      <RadioGroup 
                        id="length" 
                        className="flex space-x-4" 
                        value={length} 
                        onValueChange={setLength}
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="short" id="short" />
                          <Label htmlFor="short" className="text-slate-800">Short</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium" className="text-slate-800">Medium</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="long" id="long" />
                          <Label htmlFor="long" className="text-slate-800">Long</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-blue-600">Creativity</Label>
                      <Slider
                        value={creativity}
                        onValueChange={setCreativity}
                        max={1}
                        step={0.1}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Conservative</span>
                        <span>Balanced</span>
                        <span>Creative</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="hashtags" 
                          checked={includeHashtags} 
                          onCheckedChange={setIncludeHashtags} 
                        />
                        <Label htmlFor="hashtags" className="text-slate-800">Include hashtags</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="emojis" 
                          checked={includeEmojis} 
                          onCheckedChange={setIncludeEmojis} 
                        />
                        <Label htmlFor="emojis" className="text-slate-800">Include emojis</Label>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={generatePost} 
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      disabled={isGenerating || !topic.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate with Gemini AI
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Preview</CardTitle>
              <CardDescription className="text-slate-600">
                See how your post will look
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 min-h-32">
                {postContent ? (
                  <div className="space-y-3">
                    <p className="whitespace-pre-wrap text-slate-800">{postContent}</p>
                    {imagePreview && (
                      <div className="mt-3 relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="rounded-lg max-h-64 max-w-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center italic">Your post preview will appear here</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="image" className="text-blue-600">Add Image</Label>
                <div className="mt-2">
                  {!imagePreview ? (
                    <div className="flex items-center">
                      <label className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-4 py-2 border border-blue-100 rounded-lg text-slate-800 hover:bg-blue-50">
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                          <span>Choose image</span>
                        </div>
                        <input
                          type="file"
                          id="image"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRemoveImage}
                      className="text-blue-600 border-blue-100 hover:bg-blue-50"
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Publish options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Publish</CardTitle>
              <CardDescription className="text-slate-600">
                Choose where to post your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${twitterConnected ? 'border-blue-100' : 'border-red-100'}`}>
                  <Switch 
                    id="twitter" 
                    checked={postToTwitter} 
                    onCheckedChange={setPostToTwitter} 
                    disabled={!twitterConnected}
                  />
                  <div className="flex-1">
                    <Label htmlFor="twitter" className="flex items-center space-x-2 text-slate-800">
                      <Twitter className="h-4 w-4 text-blue-400" />
                      <span>Twitter</span>
                    </Label>
                    {!twitterConnected && (
                      <p className="text-xs text-red-500 mt-1">Not connected</p>
                    )}
                  </div>
                </div>
                
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${linkedInConnected ? 'border-blue-100' : 'border-red-100'}`}>
                  <Switch 
                    id="linkedin" 
                    checked={postToLinkedIn} 
                    onCheckedChange={setPostToLinkedIn} 
                    disabled={!linkedInConnected}
                  />
                  <div className="flex-1">
                    <Label htmlFor="linkedin" className="flex items-center space-x-2 text-slate-800">
                      <Linkedin className="h-4 w-4 text-blue-700" />
                      <span>LinkedIn</span>
                    </Label>
                    {!linkedInConnected && (
                      <p className="text-xs text-red-500 mt-1">Not connected</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={publishPost}
                disabled={isPosting || !postContent.trim() || !(postToTwitter || postToLinkedIn) || (postToTwitter && charCount > 280)}
              >
                {isPosting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publish Now
                  </>
                )}
              </Button>
              
              {(!twitterConnected || !linkedInConnected) && (
                <p className="text-xs text-slate-600 text-center">
                  Missing social accounts? <a href="/social-credentials" className="text-blue-500">Connect them here</a>
                </p>
              )}
              
              {postToTwitter && charCount > 280 && (
                <p className="text-xs text-red-500 text-center">
                  Twitter posts cannot exceed 280 characters
                </p>
              )}
            </CardFooter>
          </Card>
          
          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex space-x-2">
                  <span>•</span>
                  <span>Use emojis to increase engagement</span>
                </li>
                <li className="flex space-x-2">
                  <span>•</span>
                  <span>Keep Twitter posts under 280 characters</span>
                </li>
                <li className="flex space-x-2">
                  <span>•</span>
                  <span>Include relevant hashtags for better reach</span>
                </li>
                <li className="flex space-x-2">
                  <span>•</span>
                  <span>Images typically increase engagement by 35%</span>
                </li>
                <li className="flex space-x-2">
                  <span>•</span>
                  <span>Best times to post: 8-10am, 12-1pm, 7-9pm</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Post; 