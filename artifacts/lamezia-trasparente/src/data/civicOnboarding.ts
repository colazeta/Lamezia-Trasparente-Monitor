import type { CivicOnboardingPanelProps } from "@/components/civic/CivicOnboardingPanel";

export const civicOnboardingDemoPanels: CivicOnboardingPanelProps[] = [
  {
    title: "Modulo civico dimostrativo",
    description:
      "Esempio neutrale di introduzione per un modulo pubblico che spiega finalità informative, stato del contenuto e perimetro di lettura.",
    status: "demo",
    caution:
      "Le informazioni mostrate in questo esempio non rappresentano dati ufficiali completi e non devono essere lette come valutazioni su persone, uffici o decisioni amministrative.",
    methodologyLink: {
      label: "Leggi la nota metodologica",
      href: "/metodologia",
    },
    relatedSections: [
      {
        title: "Fonti e aggiornamenti",
        description:
          "Area di esempio per ricordare che ogni dato va collegato a fonti, frequenza di aggiornamento e limiti dichiarati.",
      },
      {
        title: "Note legali",
        description:
          "Richiamo alla lettura prudente e documentale delle informazioni pubblicate.",
        href: "/note-legali",
      },
    ],
    variant: "full",
  },
  {
    title: "Sintesi civica compatta",
    description:
      "Versione breve pensata per contesti in cui serve solo un promemoria sul perimetro del modulo.",
    status: "sperimentale",
    caution:
      "Gli indicatori sono segnali di monitoraggio e richiedono verifica sulle fonti prima di qualunque interpretazione sostanziale.",
    variant: "compact",
  },
];
