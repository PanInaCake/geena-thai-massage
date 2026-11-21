const ENABLED = true;
const REOPEN_DATE = "2026-12-26";

/** Show the closure banner through REOPEN_DATE (NZ time). Flip ENABLED to bring it back. */
export function shouldShowClosureNotice(date = new Date()): boolean {
  if (!ENABLED) {
    return false;
  }

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
        🎄 CHRISTMAS & NEW YEAR HOLIDAYS 🎄
      </h2>

      <p className="mx-auto mt-4 max-w-4xl text-base leading-relaxed text-gray-800 md:text-lg lg:text-xl">
      OPEN throughout the holiday season! CLOSED ONLY ON 25 DECEMBER 2026 AND 1 JANUARY 2027.
      </p>
    </div>
  </div>
  );
};

export default ClosureNotice;
