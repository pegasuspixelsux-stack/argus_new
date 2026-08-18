import type { ListingType } from "@/types/property";

const currency = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function PriceDisplay({
  priceDisplay,
  priceCompareAt,
  listingType,
}: {
  priceDisplay: number | null;
  priceCompareAt: number | null;
  listingType: ListingType;
}) {
  const showCompareAt =
    priceCompareAt != null && priceDisplay != null && priceCompareAt > priceDisplay;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          {priceDisplay != null ? currency.format(priceDisplay) : "Precio a consultar"}
          {priceDisplay != null && listingType === "rent" ? (
            <span className="text-lg font-normal text-muted-foreground">/mes</span>
          ) : null}
        </span>
        {showCompareAt ? (
          <span className="text-lg text-muted-foreground line-through">
            {currency.format(priceCompareAt!)}
          </span>
        ) : null}
      </div>
      {showCompareAt ? (
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Ahorras {currency.format(priceCompareAt! - priceDisplay!)}
        </span>
      ) : null}
    </div>
  );
}
