import { Link, useLocation } from 'react-router-dom';

export default function Unauthorized() {
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-semibold">Unauthorized</h1>
      <p className="text-sm text-gray-600">You don’t have access to this page.</p>
      <div className="space-x-3">
        <Link className="underline" to={from}>Go back</Link>
        <Link className="underline" to="/">Home</Link>
      </div>
    </div>
  );
}
