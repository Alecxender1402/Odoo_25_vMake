import { QuestionCard } from "./QuestionCard";

// Mock data for demonstration
const mockQuestions = [
  {
    id: "1",
    title: "How to implement JWT authentication in React with TypeScript?",
    content: "I'm trying to implement JWT authentication in my React application using TypeScript. I want to store the token securely and handle token refresh automatically. What's the best approach for this?",
    author: {
      name: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      reputation: 1250
    },
    votes: 15,
    answers: 3,
    views: 127,
    tags: ["react", "typescript", "jwt", "authentication"],
    createdAt: "2 hours ago",
    isAccepted: true,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "2",
    title: "Best practices for state management in large React applications",
    content: "I'm working on a large React application and struggling with state management. Should I use Redux, Zustand, or Context API? What are the trade-offs?",
    author: {
      name: "Mike Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      reputation: 2890
    },
    votes: 23,
    answers: 7,
    views: 342,
    tags: ["react", "state-management", "redux", "context-api"],
    createdAt: "5 hours ago",
    isAccepted: false,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "3",
    title: "How to optimize React performance for large datasets?",
    content: "I have a React component that renders a large table with thousands of rows. The performance is poor and the UI becomes unresponsive. What optimization techniques should I use?",
    author: {
      name: "Alex Rodriguez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      reputation: 750
    },
    votes: 8,
    answers: 2,
    views: 89,
    tags: ["react", "performance", "optimization", "virtualization"],
    createdAt: "1 day ago",
    isAccepted: false,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "4",
    title: "TypeScript generic constraints with React components",
    content: "I'm trying to create a reusable React component with TypeScript generics but having issues with type constraints. How can I properly constrain generic types in React components?",
    author: {
      name: "Emma Thompson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      reputation: 1680
    },
    votes: 12,
    answers: 4,
    views: 156,
    tags: ["typescript", "react", "generics", "types"],
    createdAt: "2 days ago",
    isAccepted: true,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "5",
    title: "Node.js API rate limiting best practices",
    content: "I need to implement rate limiting for my Node.js REST API. What are the best strategies and libraries to prevent abuse while maintaining good user experience?",
    author: {
      name: "David Kumar",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      reputation: 950
    },
    votes: 18,
    answers: 5,
    views: 203,
    tags: ["nodejs", "api", "rate-limiting", "security"],
    createdAt: "3 days ago",
    isAccepted: false,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "6",
    title: "CSS Grid vs Flexbox: When to use which?",
    content: "I'm confused about when to use CSS Grid versus Flexbox for layout. Can someone explain the key differences and provide examples of when each is most appropriate?",
    author: {
      name: "Lisa Zhang",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
      reputation: 1420
    },
    votes: 31,
    answers: 8,
    views: 445,
    tags: ["css", "grid", "flexbox", "layout"],
    createdAt: "4 days ago",
    isAccepted: true,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "7",
    title: "Docker containerization for Python Flask applications",
    content: "I want to containerize my Flask application using Docker. What's the best way to structure the Dockerfile and handle dependencies efficiently?",
    author: {
      name: "Carlos Martinez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      reputation: 780
    },
    votes: 14,
    answers: 3,
    views: 167,
    tags: ["docker", "python", "flask", "containerization"],
    createdAt: "5 days ago",
    isAccepted: false,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "8",
    title: "MongoDB aggregation pipeline optimization techniques",
    content: "My MongoDB aggregation queries are running slowly on large datasets. What are some optimization techniques I can use to improve performance?",
    author: {
      name: "Rachel Kim",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel",
      reputation: 2150
    },
    votes: 25,
    answers: 6,
    views: 312,
    tags: ["mongodb", "aggregation", "performance", "database"],
    createdAt: "1 week ago",
    isAccepted: true,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "9",
    title: "Vue.js 3 Composition API vs Options API",
    content: "I'm migrating from Vue 2 to Vue 3 and wondering whether to use Composition API or stick with Options API. What are the pros and cons of each approach?",
    author: {
      name: "James Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
      reputation: 1340
    },
    votes: 19,
    answers: 4,
    views: 234,
    tags: ["vuejs", "composition-api", "options-api", "migration"],
    createdAt: "1 week ago",
    isAccepted: false,
    userVote: null as 'up' | 'down' | null
  },
  {
    id: "10",
    title: "AWS Lambda cold start optimization strategies",
    content: "My AWS Lambda functions are experiencing significant cold start delays. What are the most effective strategies to minimize cold start times and improve performance?",
    author: {
      name: "Priya Patel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      reputation: 1890
    },
    votes: 22,
    answers: 7,
    views: 298,
    tags: ["aws", "lambda", "serverless", "performance"],
    createdAt: "2 weeks ago",
    isAccepted: true,
    userVote: null as 'up' | 'down' | null
  }
];

export const QuestionList = ({ questions = mockQuestions, onVote, onTagClick }: { 
  questions?: typeof mockQuestions; 
  onVote?: (questionId: string, voteType: 'up' | 'down') => void;
  onTagClick?: (tag: string) => void;
}) => {
  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard 
          key={question.id} 
          question={question} 
          onVote={onVote} 
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
};