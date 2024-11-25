export default function SeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black">
      {children}
    </div>
  );
}
