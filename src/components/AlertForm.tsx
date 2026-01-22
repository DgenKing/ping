'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import type { CoinId, AlertCondition, CryptoPrice } from '@/types';
import { COIN_MAP } from '@/types';

interface AlertFormProps {
  onSubmit: (coin: CoinId, condition: AlertCondition, targetPrice: number) => Promise<boolean>;
  currentPrices?: CryptoPrice[];
  defaultCoin?: CoinId;
  onCancel?: () => void;
}

export function AlertForm({ onSubmit, currentPrices, defaultCoin, onCancel }: AlertFormProps) {
  const [coin, setCoin] = useState<CoinId>(defaultCoin || 'bitcoin');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPrice = currentPrices?.find((p) => p.id === coin)?.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit(coin, condition, price);
    setIsSubmitting(false);

    if (success) {
      setTargetPrice('');
      onCancel?.();
    } else {
      setError('Failed to create alert');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Coin Selection */}
      <div className="space-y-2">
        <Label htmlFor="coin">Cryptocurrency</Label>
        <Select value={coin} onValueChange={(v) => setCoin(v as CoinId)}>
          <SelectTrigger id="coin" className="bg-slate-800 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {Object.entries(COIN_MAP).map(([id, { symbol, name }]) => (
              <SelectItem key={id} value={id} className="text-white hover:bg-slate-700">
                {symbol} - {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentPrice && (
          <p className="text-xs text-slate-400">
            Current price: ${currentPrice.toLocaleString()}
          </p>
        )}
      </div>

      {/* Condition Selection */}
      <div className="space-y-2">
        <Label>Condition</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={condition === 'above' ? 'default' : 'outline'}
            className={`flex-1 ${
              condition === 'above'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
            }`}
            onClick={() => setCondition('above')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Price Above
          </Button>
          <Button
            type="button"
            variant={condition === 'below' ? 'default' : 'outline'}
            className={`flex-1 ${
              condition === 'below'
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
            }`}
            onClick={() => setCondition('below')}
          >
            <TrendingDown className="mr-2 h-4 w-4" />
            Price Below
          </Button>
        </div>
      </div>

      {/* Target Price */}
      <div className="space-y-2">
        <Label htmlFor="targetPrice">Target Price (USD)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <Input
            id="targetPrice"
            type="number"
            step="any"
            min="0"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="Enter target price"
            className="bg-slate-800 border-slate-700 pl-7"
            required
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-rose-400">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-slate-700 bg-slate-800 hover:bg-slate-700"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Alert'
          )}
        </Button>
      </div>
    </form>
  );
}
