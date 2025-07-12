import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const popularTags = [
  { name: "react", count: 1250 },
  { name: "typescript", count: 980 },
  { name: "javascript", count: 2100 },
  { name: "nextjs", count: 670 },
  { name: "nodejs", count: 890 },
  { name: "css", count: 1400 },
  { name: "html", count: 760 },
  { name: "python", count: 1820 }
];

export const FilterSidebar = () => {
  const [selectedSort, setSelectedSort] = useState("newest");
  const navigate = useNavigate();

  const handleTagClick = (tagName: string) => {
    navigate(`/questions?tag=${encodeURIComponent(tagName)}`);
  };

  return (
    <div className="space-y-6">
      {/* Popular Tags */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Popular Tags</h3>
        <div className="space-y-2">
          {popularTags.map((tag) => (
            <div key={tag.name} className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name}
              </Badge>
              <span className="text-xs text-muted-foreground">{tag.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Community Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Questions</span>
            <span className="font-medium">12,847</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Answers</span>
            <span className="font-medium">28,391</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Users</span>
            <span className="font-medium">4,256</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Tags</span>
            <span className="font-medium">1,847</span>
          </div>
        </div>
      </Card>
    </div>
  );
};