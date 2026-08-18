"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const HEADLINE = "Tu asesor de confianza en Punta del Este";

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
            Especialistas en Punta del Este
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
            Ya sea que busques una inversión inteligente o el refugio de
            vacaciones ideal, te acompañamos como un amigo experto en cada
            paso — no somos un portal más, somos tu equipo boutique en la
            península y sus alrededores.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="mt-10 flex flex-col items-start gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto"
              nativeButton={false}
              render={<Link href="#asesoria" />}
            >
              Hablemos de tu próximo proyecto
              <ArrowRight />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              nativeButton={false}
              render={<Link href="#listings" />}
            >
              <Building2 />
              Ver propiedades destacadas
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
