/* eslint-disable prettier/prettier */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ArrowLeft, Play, ExternalLink } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";


import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  component: Help,
});

const tutorials = [
  {
    title: "Getting started with Street Smart",
    duration: "3:42",
    url: "https://www.youtube.com/results?search_query=emergency+app+getting+started",
  },
  {
    title: "How to trigger an SOS alert",
    duration: "2:18",
    url: "https://www.youtube.com/results?search_query=sos+alert+tutorial",
  },
  {
    title: "Setting up emergency contacts",
    duration: "4:05",
    url: "https://www.youtube.com/results?search_query=emergency+contacts+setup",
  },
  {
    title: "Configuring device shortcuts",
    duration: "5:21",
    url: "https://www.youtube.com/results?search_query=phone+shortcut+setup",
  },
];

const faqs = [
  {
    q: "How do I trigger an emergency alert?",
    a: "Press and hold the red SOS button on the home screen for 2 seconds. A 30-second countdown will start, giving you time to cancel if it was accidental.",
  },
  {
    q: "Can I cancel an alert after it's triggered?",
    a: "Yes. While the countdown is active, tap the Cancel button on the emergency screen. Once the timer ends, your contacts will be notified.",
  },
  {
    q: "What happens when an alert is sent?",
    a: "Your selected emergency contacts receive an SMS with your live location and a link to track you. If configured, emergency services are also contacted.",
  },
  {
    q: "Why does the app need location permission?",
    a: "Location is required so your contacts and responders know where to find you. It is only accessed during an active emergency.",
  },
  {
    q: "Does the app work without internet?",
    a: "SMS alerts work over your carrier network even without internet. Live location tracking requires a data or Wi-Fi connection.",
  },
  {
    q: "How many emergency contacts can I add?",
    a: "You can add up to 10 emergency contacts. We recommend adding at least 3 trusted people.",
  },
];

function Help() {
  const navigate = useNavigate();

  return (
    <MobileShell>
        <ScreenHeader title="Help & Support" back="/settings" />
      <div className="px-5 pt-8 pb-6">
        {/* Header */}
       {/*  <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate({ to: "/settings" })}
            className="p-1"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>

          <h1 className="text-xl font-bold text-foreground">Help</h1>
        </div> */}

        {/* Video tutorials */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Video tutorials
          </h2>

          <div className="space-y-2">
            {tutorials.map((t) => (
              <a
                key={t.title}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:bg-secondary transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-emergency-soft text-emergency flex items-center justify-center shrink-0">
                  <Play className="h-4 w-4 fill-current" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {t.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    YouTube • {t.duration}
                  </p>
                </div>

                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              </a>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Frequently asked questions
          </h2>

          <div className="rounded-2xl bg-card border border-border px-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-border last:border-0"
                >
                  <AccordionTrigger className="text-sm font-medium text-foreground text-left hover:no-underline">
                    {f.q}
                  </AccordionTrigger>

                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </MobileShell>
  );
}

export default Help;