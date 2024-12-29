export interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
  };
  upvotes: number;
  upvotedBy: string[]; // Array of user IDs who upvoted
  createdAt: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  responses: FeedbackResponse[];
  isAdmin?: boolean;
}

export interface FeedbackResponse {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
  createdAt: string;
}

export interface NewFeedbackInput {
  title: string;
  description: string;
}
