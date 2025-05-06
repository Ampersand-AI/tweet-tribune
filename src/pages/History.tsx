import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const History = () => {
  const navigate = useNavigate();

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
          className="text-3xl font-bold text-text-blue-600"
        >
          Tweet History
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-black/70"
        >
          View all your tweet activity that has been published to Twitter
        </motion.p>
      </div>
        
        <Card>
          <CardHeader>
          <CardTitle className="text-black">Your Posted Tweets</CardTitle>
          <CardDescription className="text-black/70">
              View all your tweet activity that has been published to Twitter
            </CardDescription>
          </CardHeader>
          <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No posted tweets found yet</h3>
            <p className="text-black/70 mb-6">
              Schedule tweets to see them here after they're posted.
                </p>
            <Button
              onClick={() => navigate('/schedule')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
                    Schedule Tweets
                  </Button>
              </div>
          </CardContent>
        </Card>
    </motion.div>
  );
};

export default History;
