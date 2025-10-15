import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-6xl font-bold text-gray-900">
          Welcome to <span className="text-blue-600">ShopSmart</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover products tailored to your preferences with AI-powered
          recommendations
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

