import React from "react";
import { Header, User } from "@/components/layout/Header";
import { PaginationSummary } from "@/components/ui/pagination-summary";

interface PaginationDemoProps {
  currentUser: User;
  onLogin: (user: User) => void;
}

const PaginationDemo = ({ currentUser, onLogin }: PaginationDemoProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header
        currentUser={currentUser}
        onLogin={onLogin}
        onAskQuestion={() => {}}
      />

      <div className="container py-8">
        <PaginationSummary />
      </div>
    </div>
  );
};

export default PaginationDemo;
