"use client"

import { HelpCircle, Users, Calendar, Trophy, Shield, Crown } from "lucide-react"

export default function HelpPage() {
  const faqs = [
    {
      question: "როგორ დავარეგისტრირო გუნდი?",
      answer:
        "პირველ რიგში უნდა შექმნათ ანგარიში. შემდეგ გადადით პროფილზე და აირჩიეთ 'გუნდის რეგისტრაცია'. შეავსეთ ყველა საჭირო ინფორმაცია თქვენი გუნდის და მოთამაშეების შესახებ.",
      icon: Users,
    },
    {
      question: "რა მოხდება რეგისტრაციის შემდეგ?",
      answer:
        "რეგისტრაციის შემდეგ თქვენი გუნდი გაიგზავნება ადმინისტრაციის დასადასტურებლად. ადმინისტრატორები შეამოწმებენ ინფორმაციას და დაადასტურებენ ან უარყოფენ თქვენს განაცხადს.",
      icon: Shield,
    },
    {
      question: "როგორ ვიცოდე მატჩების განრიგი?",
      answer:
        "ყველა მატჩის განრიგი გამოქვეყნებულია 'განრიგი' გვერდზე. ასევე შეგიძლიათ შემოგვიერთდეთ Discord სერვერზე, სადაც მიიღებთ ყველა განახლებას რეალურ დროში.",
      icon: Calendar,
    },
    {
      question: "რა არის VIP გუნდი?",
      answer:
        "VIP გუნდები არის განსაკუთრებული სტატუსის მქონე გუნდები, რომლებიც გამოირჩევიან თავიანთი შესრულებით და აქტივობით. VIP გუნდებს აქვთ პრიორიტეტი რეგისტრაციაში და სპეციალური აღნიშვნა საიტზე.",
      icon: Crown,
    },
    {
      question: "რატომ შეიძლება დაიბლოკოს გუნდი?",
      answer:
        "გუნდი შეიძლება დაიბლოკოს წესების დარღვევის შემთხვევაში, მათ შორის: ჩიტინგის გამოყენება, არასწორი ინფორმაციის მიწოდება, უხეში ქცევა სხვა მოთამაშეების მიმართ, ან მატჩებზე გამოუცხადებლობა.",
      icon: Shield,
    },
    {
      question: "სად ვნახო შედეგები?",
      answer:
        "ყველა ტურნირის შედეგი ქვეყნდება 'შედეგები' გვერდზე. იქ ნახავთ გამარჯვებულ გუნდებს, ქულებს და ფოტო მასალას თითოეული ტურნირიდან.",
      icon: Trophy,
    },
  ]

  return (
    <div className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-20 text-center animate-reveal">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8">
            <HelpCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter italic uppercase">
            Help <span className="text-primary tracking-normal">Center</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            ხშირად დასმული შეკითხვები
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass-card p-8 group animate-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex gap-6">
                <div className="w-14 h-14 rounded-2xl glass border border-white/5 flex items-center justify-center shrink-0 group-hover:border-primary/50 transition-colors">
                  <faq.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-3 italic tracking-tight uppercase group-hover:text-primary transition-colors">{faq.question}</h3>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-12 lg:p-16 text-center animate-reveal relative overflow-hidden group">
           <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           <h2 className="text-3xl lg:text-4xl font-black text-white mb-6 italic tracking-tighter uppercase relative z-10">ჯერ კიდევ გაქვთ შეკითხვები?</h2>
           <p className="text-muted-foreground font-light italic mb-10 max-w-2xl mx-auto relative z-10">
              თუ ვერ იპოვეთ პასუხი თქვენს შეკითხვაზე, დაგვიკავშირდით Discord-ზე ან გამოიყენეთ კონტაქტის გვერდი
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <button className="px-8 py-4 rounded-2xl glass border border-primary/30 text-primary font-black uppercase tracking-widest hover:bg-primary/10 transition-all">
                Discord Support
              </button>
              <button className="px-8 py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-widest hover:bg-primary/80 transition-all">
                Contact Page
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
