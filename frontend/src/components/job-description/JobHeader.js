export default function JobHeader() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white shadow-xl">

      <p className="uppercase tracking-[0.25em] text-sm opacity-80">
        AI Resume Scanner
      </p>

      <h1 className="text-4xl font-bold mt-3">
        Resume Match
      </h1>

      <p className="mt-3 max-w-2xl text-blue-100">
        Select an available Job Description below to match with your uploaded resumes and discover your ATS Score.
      </p>

    </div>
  );
}
