"use client";

import { motion } from "motion/react";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

const HEADLINE = "Encuentra tu próximo hogar sin complicaciones";

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[520px] items-center overflow-hidden border-b border-border/60 py-24 sm:min-h-[640px] sm:py-32"
    >
      {/* Background image */}
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop"
          alt=""
          className="size-full object-cover object-center"
        />
      </div>

      {/* Legibility overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/50 to-black/10"
      />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-xl flex-col items-start text-left">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
          >
            Nuevas propiedades cada semana
          </motion.span>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            {HEADLINE.split(" ").map((word, index) => (
              <motion.span
                key={word + index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08, ease: "easeInOut" }}
                className="mr-[0.3ch] inline-block last:mr-0"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="mt-6 max-w-lg text-balance text-lg text-white/70 sm:text-xl"
          >
            En Argus compras con precios claros, propiedades verificadas y
            financiación flexible — todo desde un mismo lugar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="mt-10 flex flex-col items-start gap-3 sm:flex-row"
          >
            <Button size="lg" className="w-full sm:w-auto">
              Explorar propiedades
              <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <PlayCircle />
              Cómo funciona
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
