import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          რეგისტრაცია წარმატებულია!
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <p className="text-gray-300 mb-4">
            გთხოვთ შეამოწმოთ თქვენი ელ.ფოსტა დადასტურების ლინკისთვის.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            დადასტურების შემდეგ შეძლებთ სისტემაში შესვლას.
          </p>
          <Link 
            href="/login"
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            შესვლის გვერდზე გადასვლა
          </Link>
        </div>
      </div>
    </div>
  );
}
