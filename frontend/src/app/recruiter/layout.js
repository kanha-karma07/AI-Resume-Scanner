import RecruiterSidebar from "@/components/recruiter/RecruiterSidebar";

export const metadata = {
  title: "Recruiter Dashboard | ResumeAI",
  description: "Recruiter module for AI Resume Scanner",
};

export default function RecruiterLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <RecruiterSidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 w-full transition-all duration-300">
        <main className="min-h-screen w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
