import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Users } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gradient-to-br from-black via-gray-900 to-blue-950">
      <div className="w-full max-w-md">
        <Card className="border-blue-500/20 bg-black/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <CardTitle className="text-2xl text-blue-400 text-center">რეგისტრაცია წარმატებულია!</CardTitle>
            <CardDescription className="text-gray-400 text-center">ახლა გუნდის შექმნის დრო</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-300 text-center">
                თქვენი ანგარიში წარმატებით შეიქმნა და წადილი ხართ მოტამაშე!
              </p>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 space-y-3">
                <p className="text-sm text-gray-200 font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  შემდეგი ნაბიჯი
                </p>
                <p className="text-sm text-gray-300">
                  თქვენი გუნდის რეგისტრაციის გაკეთება ხელმისაწვდომი დასახმარებელი ყველა თამაშისთვის.
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/profile/register-team">გუნდის რეგისტრაცია</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-blue-500/30 hover:bg-blue-500/10 bg-transparent">
                  <Link href="/profile">პროფილი</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
