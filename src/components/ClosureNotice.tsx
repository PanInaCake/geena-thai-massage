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
      className="w-full border-b-2 border-amber-600/40 bg-amber-100 px-4 py-5 md:px-8 md:py-6"
    >
      <div className="container mx-auto max-w-5xl text-center">
      <h2 className="text-xl font-extrabold leading-tight text-amber-900 whitespace-nowrap md:text-2xl lg:text-3xl">We are temporarily closed from 12th of July until the 1st of August</h2>
        <p className="mx-auto mt-3 max-w-4xl text-base leading-relaxed text-primary/90 md:mt-4 md:text-lg lg:text-xl">
          We are temporarily closed for a short period due to unforeseen personal circumstances. We
          appreciate your patience and understanding during this time, and we look forward to welcoming you
          back on the 2nd of August.
        </p>
      </div>
    </div>
  );
};

export default ClosureNotice;
