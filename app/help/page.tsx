import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, HelpCircle, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
        title: "განახლებული წესები",
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
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl.font-bold text-white">დახმარება და წესები</h1>
        <p className="text-gray-400">გაეცანით პლატფორმის წესებს და ხშირად დასმულ კითხვებს</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xl font-semibold text-yellow-500">
            <AlertTriangle />
            <h2>წესები</h2>
          </div>
          
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <Card key={index} className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-200">{rule.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{rule.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xl font-semibold text-blue-500">
            <HelpCircle />
            <h2>ხშირად დასმული კითხვები</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-zinc-800">
                <AccordionTrigger className="text-gray-200 hover:text-white">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="bg-blue-950/20 border-blue-900/30 mt-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="text-blue-400" />
                <CardTitle className="text-blue-400">ვერ იპოვეთ პასუხი?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                თუ თქვენს კითხვაზე პასუხი ვერ იპოვეთ, გთხოვთ დაგვიკავშირდეთ კონტაქტის გვერდიდან.
              </p>
              <Link 
                href="/contact" 
                className="inline-block px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded hover:bg-blue-600/30 transition-colors"
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
