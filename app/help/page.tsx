import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, HelpCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default async function HelpPage() {
  const items = await prisma.systemConfig.findMany();
  const cfg: Record<string, string> = {};
  items.forEach(i => cfg[i.key] = i.value);

  let rules = [
    {
      title: "1. ზოგადი წესები",
      content: "აკრძალულია ნებისმიერი სახის შეურაცხყოფა, რასისტული ან დისკრიმინაციული გამონათქვამები. ყველა მონაწილე ვალდებულია პატივი სცეს სხვა მოთამაშეებს და ადმინისტრაციას."
    },
    {
      title: "2. რეგისტრაცია",
      content: "გუნდს უნდა ჰყავდეს მინიმუმ 4 მოთამაშე. ერთი მოთამაშე არ შეიძლება იყოს რეგისტრირებული რამდენიმე გუნდში ერთდროულად. ლიდერი პასუხისმგებელია გუნდის ინფორმაციის სისწორეზე."
    },
    {
      title: "3. სკრიმები და ტურნირები",
      content: "გუნდი ვალდებულია გამოცხადდეს მითითებულ დროს. დაგვიანების შემთხვევაში გუნდი შეიძლება მოიხსნას სკრიმიდან. Room Info-ს გაზიარება გარე პირებზე მკაცრად აკრძალულია."
    },
    {
      title: "4. ჩეთები და პროგრამები",
      content: "ნებისმიერი სახის დამხმარე პროგრამის (Cheats, Scripts) გამოყენება გამოიწვევს გუნდის მუდმივ დაბლოკვას. ეჭვის შემთხვევაში ადმინისტრაცია იტოვებს უფლებას მოითხოვოს მოთამაშის შემოწმება."
    }
  ];

  if (cfg.help_rules) {
    rules = [
      {
        title: "სისტემური წესები",
        content: cfg.help_rules
      }
    ];
  }

  let faqs = [
    {
      question: "როგორ დავარეგისტრირო გუნდი?",
      answer: "გუნდის დასარეგისტრირებლად უნდა გაიაროთ ავტორიზაცია, გადახვიდეთ 'გუნდის შექმნა' გვერდზე და შეავსოთ საჭირო ინფორმაცია."
    },
    {
      question: "როგორ მივიღო VIP სტატუსი?",
      answer: "VIP სტატუსის შესახებ ინფორმაცია შეგიძლიათ იხილოთ 'VIP' გვერდზე. დეტალებისთვის დაგვიკავშირდით."
    },
    {
      question: "რა ხდება თუ სკრიმზე ვერ გამოვცხადდით?",
      answer: "თუ სკრიმზე ვერ ახერხებთ გამოცხადებას, ვალდებული ხართ გააუქმოთ რეგისტრაცია დაწყებამდე მინიმუმ 30 წუთით ადრე."
    }
  ];

  if (cfg.help_faq) {
    faqs = [
      {
        question: "FAQ",
        answer: cfg.help_faq
      }
    ];
  }

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="დახმარება & წესები"
        description="გაეცანით პლატფორმის წესებს და ხშირად დასმულ კითხვებს"
      />

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">ოპერაციული წესები</h2>
          </div>

          <div className="space-y-4">
            {rules.map((rule, index) => (
              <Card key={index} className="bg-[#06070a] border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300">
                <CardHeader className="bg-white/[0.02] border-b border-white/5 py-4">
                  <CardTitle className="text-sm font-black text-amber-400 uppercase tracking-widest">{rule.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-cyber-muted text-sm font-medium leading-relaxed">{rule.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">ხშირად დასმული კითხვები</h2>
          </div>

          <div className="bg-[#06070a] border border-white/5 rounded-2xl p-6 shadow-2xl">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-white/5 px-4 rounded-xl hover:bg-white/[0.02] transition-colors border-b-0">
                  <AccordionTrigger className="text-sm font-bold text-white uppercase tracking-tight hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-cyber-muted text-sm leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <Card className="bg-primary/5 border-primary/20 rounded-2xl overflow-hidden mt-8 ring-1 ring-primary/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="text-primary w-5 h-5" />
                <CardTitle className="text-primary text-lg font-black uppercase tracking-tight">ვერ იპოვეთ პასუხი?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-cyber-muted text-sm font-medium mb-6">
                თუ თქვენს კითხვაზე პასუხი ვერ იპოვეთ, გთხოვთ დაგვიკავშირდეთ კონტაქტის გვერდიდან. ჩვენი გუნდი მალევე გიპასუხებთ.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                კონტაქტის გვერდი
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
