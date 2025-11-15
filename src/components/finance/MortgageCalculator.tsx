'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';

const banks = [
  { id: 'vtb', name: 'ВТБ', rate: 12.9 },
  { id: 'sber', name: 'Сбер', rate: 13.2 },
  { id: 'tinkoff', name: 'Тинькофф', rate: 14.5 },
  { id: 'alpha', name: 'Альфа-банк', rate: 13.8 },
];

const termOptions = [10, 15, 20, 25, 30];

const storageKey = 'broks:mortgage-history';

type HistoryItem = {
  id: string;
  price: number;
  downPayment: number;
  rate: number;
  term: number;
  monthlyPayment: number;
  roi: number;
  timestamp: string;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value);

export function MortgageCalculator({ price }: { price: number }) {
  const [amount, setAmount] = useState(price);
  const [downPayment, setDownPayment] = useState(Math.round(price * 0.2));
  const [term, setTerm] = useState(20);
  const [rate, setRate] = useState(banks[0].rate);
  const [rentIncome, setRentIncome] = useState(Math.round(price * 0.008));
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as HistoryItem[];
        setHistory(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 5)));
    }
  }, [history]);

  const loanBody = Math.max(amount - downPayment, 0);

  const monthlyPayment = useMemo(() => {
    if (loanBody <= 0) return 0;
    const monthlyRate = rate / 100 / 12;
    const totalMonths = term * 12;
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    return Math.round((loanBody * monthlyRate * factor) / (factor - 1));
  }, [loanBody, rate, term]);

  const roi = useMemo(() => {
    if (!monthlyPayment) return 0;
    const annualProfit = rentIncome * 12 - monthlyPayment * 12;
    if (downPayment <= 0) return 0;
    return Number(((annualProfit / downPayment) * 100).toFixed(1));
  }, [monthlyPayment, rentIncome, downPayment]);

  const saveScenario = () => {
    const record: HistoryItem = {
      id: crypto.randomUUID(),
      price: amount,
      downPayment,
      rate,
      term,
      monthlyPayment,
      roi,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [record, ...prev].slice(0, 5));
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Финансы</p>
          <h2 className="text-2xl font-semibold text-neutral-900">Ипотека и ROI</h2>
        </div>
        <Button variant="secondary" size="sm" onClick={saveScenario} disabled={!monthlyPayment}>
          Сохранить расчёт
        </Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-neutral-600">
          Стоимость объекта, ₽
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-neutral-600">
          Первоначальный взнос, ₽
          <input
            type="number"
            min={0}
            value={downPayment}
            onChange={(event) => setDownPayment(Number(event.target.value))}
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-neutral-600">
          Ставка банка
          <select
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2"
          >
            {banks.map((bank) => (
              <option key={bank.id} value={bank.rate}>{`${bank.name} · ${bank.rate}%`}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-neutral-600">
          Срок, лет
          <select
            value={term}
            onChange={(event) => setTerm(Number(event.target.value))}
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2"
          >
            {termOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-neutral-600">
          Потенциальная аренда, ₽/мес
          <input
            type="number"
            min={0}
            value={rentIncome}
            onChange={(event) => setRentIncome(Number(event.target.value))}
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </label>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
          <p className="text-sm text-neutral-500">Ежемесячный платеж</p>
          <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(monthlyPayment)} ₽</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
          <p className="text-sm text-neutral-500">ROI (доходность)</p>
          <p className="text-2xl font-semibold text-neutral-900">{roi}%</p>
        </div>
      </div>
      {history.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase text-neutral-500">Сохранённые сценарии</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            {history.map((record) => (
              <li key={record.id} className="rounded-2xl border border-neutral-100 bg-neutral-50 px-3 py-2">
                {new Date(record.timestamp).toLocaleDateString('ru-RU')} · {formatCurrency(record.price)} ₽ · ставка {record.rate}% · {record.term} лет · платёж {formatCurrency(record.monthlyPayment)} ₽ · ROI {record.roi}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
