export default function AdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-10 h-10 text-white"
        >
          <path d="M12 2v4M5 6l2 2M19 6l-2 2M6 12H2M22 12h-4M7 18l-2-2M17 18l2-2M12 18v4" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
        Admin Dashboard
      </h1>
      <p className="text-zinc-400 mt-3 max-w-md mx-auto">
        Welcome to the VidSpark admin panel. Select a section from the navigation to manage content types, media, users, and more.
      </p>
    </div>
  );
}
