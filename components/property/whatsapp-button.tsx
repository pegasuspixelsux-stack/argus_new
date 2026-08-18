import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

function buildWhatsAppMessage(propertyTitle: string, propertyUrl: string) {
  return `¡Hola! Estoy interesado/a en ${propertyTitle}. ¿Me cuentas más? ${propertyUrl}`;
}

export function WhatsAppButton({
  phoneNumber,
  propertyTitle,
  propertyUrl,
}: {
  phoneNumber: string | undefined;
  propertyTitle: string;
  propertyUrl: string;
}) {
  if (!phoneNumber) {
    return (
      <div className="flex flex-col gap-1">
        <Button type="button" disabled className="w-full bg-[#25D366] text-white">
          <MessageCircle />
          Chatear por WhatsApp
        </Button>
        <p className="text-xs text-muted-foreground">
          El contacto por WhatsApp todavía no está configurado.
        </p>
      </div>
    );
  }

  const message = buildWhatsAppMessage(propertyTitle, propertyUrl);
  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Button
      nativeButton={false}
      render={<a href={href} target="_blank" rel="noopener noreferrer" />}
      className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5b]"
    >
      <MessageCircle />
      Chatear por WhatsApp
    </Button>
  );
}
