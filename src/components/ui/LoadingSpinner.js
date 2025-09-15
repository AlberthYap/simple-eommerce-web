export default function LoadingSpinner({ size = "md", text }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizes[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
      />
      {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
    </div>
  );
}
