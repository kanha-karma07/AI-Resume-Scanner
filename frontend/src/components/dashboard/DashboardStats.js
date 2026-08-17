"use client";

export default function DashboardStats({ resumes }) {

  const totalResumes = resumes.length;

  const highestATS =
    resumes.length > 0
      ? Math.max(...resumes.map((r) => r.ats_score || 0))
      : 0;

  const averageATS =
    resumes.length > 0
      ? Math.round(
          resumes.reduce((sum, r) => sum + (r.ats_score || 0), 0) /
            resumes.length
        )
      : 0;

  const completed =
    resumes.filter((r) => r.status === "Completed").length;

  const stats = [
    {
      title: "Total Resumes",
      value: totalResumes,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Highest ATS",
      value: `${highestATS}%`,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Average ATS",
      value: `${averageATS}%`,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Completed",
      value: completed,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

      {stats.map((item, index) => (

        <div
          key={index}
          className={`${item.bg} rounded-xl shadow p-6`}
        >

          <h3 className="text-gray-500 text-sm">
            {item.title}
          </h3>

          <p className={`text-3xl font-bold mt-3 ${item.color}`}>
            {item.value}
          </p>

        </div>

      ))}

    </div>
  );
}
