import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Zap, Shield, Crown } from "lucide-react";

export default function VIPPage() {
  const benefits = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "პრიორიტეტული სლოტი",
      description: "VIP გუნდები ავტომატურად იკავებენ სლოტებს სკრიმებზე, რიგის გარეშე."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "დაცული სტატუსი",
      description: "გარანტირებული ადგილი ტურნირებში და სპეციალურ ივენთებზე."
    },
    {
      icon: <Crown className="w-8 h-8 text-purple-500" />,
      title: "სპეციალური ნიშანი",
      description: "გუნდის გვერდზე და ცხრილებში გამოჩნდება VIP სტატუსის აღმნიშვნელი ნიშანი."
    },
    {
      icon: <Star className="w-8 h-8 text-green-500" />,
      title: "სტატისტიკა",
      description: "წვდომა დამატებით სტატისტიკურ მონაცემებზე."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          VIP სტატუსი
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          მიიღეთ განსაკუთრებული პრივილეგიები და გააუმჯობესეთ თქვენი გუნდის გამოცდილება ჩვენს პლატფორმაზე
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {benefits.map((benefit, index) => (
          <Card key={index} className="bg-zinc-900/50 border-zinc-800 hover:border-yellow-500/30 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  {benefit.icon}
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border border-yellow-900/30 text-center space-y-6">
        <h2 className="text-2xl font-bold text-yellow-500">გსურთ VIP სტატუსის მიღება?</h2>
        <p className="text-gray-300">
          VIP სტატუსის მისაღებად დაუკავშირდით ადმინისტრაციას Discord-ზე ან საკონტაქტო ფორმის საშუალებით.
        </p>
        <button className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-black font-bold rounded-lg transition-colors">
          დაგვიკავშირდით
        </button>
      </div>
    </div>
  );
}
