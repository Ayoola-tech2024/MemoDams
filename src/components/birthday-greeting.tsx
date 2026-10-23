
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PartyPopper } from "lucide-react";

interface BirthdayGreetingProps {
  name?: string | null;
}

export function BirthdayGreeting({ name }: BirthdayGreetingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Open the dialog after a short delay to allow the page to render
    const timer = setTimeout(() => {
      setIsOpen(true);
      setShowConfetti(true);
    }, 500);
    
    // Hide confetti after animation
    const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
    }, 8000)

    return () => {
        clearTimeout(timer);
        clearTimeout(confettiTimer);
    }
  }, []);

  return (
    <>
      {showConfetti && <Confetti />}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <PartyPopper className="h-8 w-8 text-primary" />
              Happy Birthday!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-lg">
              Wishing you a fantastic day, {name || "friend"}!
            </p>
            <p className="text-muted-foreground mt-2">
              We hope you have a celebration as amazing as you are.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


function Confetti() {
    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[200]">
            {Array.from({ length: 150 }).map((_, i) => (
                <div
                    key={i}
                    className="confetti-piece"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 3 + 2}s`,
                        animationDelay: `${Math.random() * 2}s`,
                        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes fall {
                    0% {
                        transform: translateY(-10vh) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(110vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .confetti-piece {
                    position: absolute;
                    width: 8px;
                    height: 16px;
                    opacity: 0;
                    animation-name: fall;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    )
}
