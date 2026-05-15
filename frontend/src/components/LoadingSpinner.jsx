export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}
