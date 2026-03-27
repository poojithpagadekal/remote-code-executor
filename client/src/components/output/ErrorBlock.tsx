interface ErrorBlockProps {
  message: string;
}

export default function ErrorBlock({ message }: ErrorBlockProps) {
  return (
    <div
      className="rounded p-3 text-xs"
      style={{
        backgroundColor: "#bc3f3c11",
        border: "1px solid #bc3f3c44",
        color: "#bc3f3c",
      }}
    >
      {message}
    </div>
  );
}