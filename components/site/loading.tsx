export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="site-loading" aria-label="Ma’lumotlar yuklanmoqda" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <div className="site-loading-row" key={index}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
