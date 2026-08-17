"use client";

import { FileText, Star, CheckCircle } from "lucide-react";

export default function StatsCards({ resumes }) {

  const total = resumes.length;

  const completed = resumes.filter(
    (resume) => resume.status === "Completed"
  ).length;

  const avgATS =
    total > 0
      ? Math.round(
          resumes.reduce(
            (sum, resume) => sum + (resume.ats_score || 0),
            0
          ) / total
        )
      : 0;

  const cards = [
    {
      title: "Total Resumes",
      value: total,
      icon: FileText,
    },
    {
      title: "Average ATS",
      value: `${avgATS}%`,
      icon: Star,
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">

      {cards.map((card, index) => {

        const Icon = card.icon;

        return (

          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
          >

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  {card.title}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {card.value}
                </h2>

              </div>

              <div className="bg-blue-100 p-4 rounded-xl">

                <Icon
                  size={28}
                  className="text-blue-600"
                />

              </div>

            </div>

          </div>

        );

      })}

    </div>
  );

}
