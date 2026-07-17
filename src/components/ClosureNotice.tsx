const REOPEN_DATE = "2026-08-02";

/** Show the closure banner through 1 August (NZ time); hide from 2 August onward. */
export function shouldShowClosureNotice(date = new Date()): boolean {
  const nzDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return nzDate < REOPEN_DATE;
}

const ClosureNotice = () => {
  if (!shouldShowClosureNotice()) {
    return null;
  }

  return (
      <div
    role="status"
    aria-live="polite"
    className="w-full border-b-2 border-red-600 bg-white px-4 py-6"
  >
    <div className="mx-auto w-full max-w-7xl text-center">
      <h2 className="mx-auto text-center text-3xl font-black leading-tight text-red-700 md:text-5xl lg:text-6xl">
        We are temporarily closed from 12th of July until the 1st of August
      </h2>

      <p className="mx-auto mt-4 max-w-4xl text-base leading-relaxed text-gray-800 md:text-lg lg:text-xl">
        We are temporarily closed for a short period due to unforeseen personal
        circumstances. We appreciate your patience and understanding during this
        time, and we look forward to welcoming you back on the 2nd of August.
      </p>
    </div>
  </div>
  );
};

export default ClosureNotice;
