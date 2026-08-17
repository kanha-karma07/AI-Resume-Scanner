import { FileBox } from "lucide-react";
import Link from "next/link";

export default function EmptyState({ 
  icon: Icon = FileBox, 
  title = "No data found", 
  description = "Get started by creating a new record.",
  actionText = null,
  actionHref = null
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center w-full">
      <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
        <Icon size={40} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-8">{description}</p>
      
      {actionText && actionHref && (
        <Link 
          href={actionHref}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-blue-500/20"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
