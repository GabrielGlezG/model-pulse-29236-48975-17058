import { Currency, useCurrency, CURRENCY_SYMBOLS, CURRENCY_NAMES } from '@/contexts/CurrencyContext'
import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'

const currencies: Currency[] = ['CLP', 'USD', 'GBP', 'JPY', 'CNY']

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
        <DollarSign className="h-4 w-4" />
        <span className="hidden sm:inline">Moneda:</span>
      </div>
      <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
        {currencies.map((curr) => (
          <Button
            key={curr}
            variant={currency === curr ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrency(curr)}
            className={`min-w-[50px] sm:min-w-[65px] h-8 sm:h-9 px-2 sm:px-3 ${
              currency === curr
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-card-foreground hover:bg-primary/10'
            }`}
            title={CURRENCY_NAMES[curr]}
          >
            <span className="font-semibold text-xs sm:text-sm">{CURRENCY_SYMBOLS[curr]}</span>
            <span className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs">{curr}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
