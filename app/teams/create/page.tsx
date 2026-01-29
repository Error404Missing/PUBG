import CreateTeamForm from "@/components/CreateTeamForm";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateTeamPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          გუნდის რეგისტრაცია
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          შეავსეთ ინფორმაცია თქვენი გუნდის შესახებ. რეგისტრაციის შემდეგ ადმინისტრაცია განიხილავს განაცხადს.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <CreateTeamForm />
        </div>
      </div>
    </div>
  );
}
