import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          ავტორიზაციის შეცდომა
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <p className="text-gray-300 mb-4">
            დაფიქსირდა შეცდომა ავტორიზაციის დროს.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            გთხოვთ სცადოთ თავიდან ან დაგვიკავშირდეთ თუ პრობლემა გრძელდება.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/login"
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              შესვლა
            </Link>
            <Link 
              href="/"
              className="inline-flex justify-center py-2 px-4 border border-neutral-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-transparent hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
            >
              მთავარი
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
