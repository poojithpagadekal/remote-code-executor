export default function LoadingState() {
  return (
    <div
      className="flex items-center gap-2 text-xs"
      style={{ color: "#a9b7c6" }}
    >
      <span
        className="w-3 h-3 border rounded-full animate-spin"
        style={{ borderColor: "#515151", borderTopColor: "#4a9eda" }}
      />
      Executing...
    </div>
  );
}