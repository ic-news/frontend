import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-6xl font-bold text-gray-800 mb-4 relative">
        404
        <img src={logo} alt="logo" className="w-16 h-16 absolute -top-14 -right-14" />
      </h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <Link to="/" className="px-6 py-2 text-white bg-[var(--color-primary)] rounded-lg">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
