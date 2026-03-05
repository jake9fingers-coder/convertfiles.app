import { useState, useMemo, useEffect } from 'react'
import { ArrowRightLeft, TrendingUp } from 'lucide-react'
import Select from 'react-select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrencyRates } from '../hooks/useCurrencyRates'
import Features from '../components/Features'
import RelatedTools from '../components/RelatedTools'
import GenericSEOContent from '../components/GenericSEOContent'

// Expanded list of global currencies for the searchable dropdown
const ALL_CURRENCIES = [
    { value: 'usd', label: 'US Dollar (USD)' },
    { value: 'eur', label: 'Euro (EUR)' },
    { value: 'gbp', label: 'British Pound (GBP)' },
    { value: 'jpy', label: 'Japanese Yen (JPY)' },
    { value: 'inr', label: 'Indian Rupee (INR)' },
    { value: 'cad', label: 'Canadian Dollar (CAD)' },
    { value: 'aud', label: 'Australian Dollar (AUD)' },
    { value: 'chf', label: 'Swiss Franc (CHF)' },
    { value: 'cny', label: 'Chinese Yuan (CNY)' },
    { value: 'mxn', label: 'Mexican Peso (MXN)' },
    { value: 'php', label: 'Philippine Peso (PHP)' },
    { value: 'brl', label: 'Brazilian Real (BRL)' },
    { value: 'zar', label: 'South African Rand (ZAR)' },
    { value: 'nok', label: 'Norwegian Krone (NOK)' },
    { value: 'sek', label: 'Swedish Krona (SEK)' },
    { value: 'dkk', label: 'Danish Krone (DKK)' },
    { value: 'rub', label: 'Russian Ruble (RUB)' },
    { value: 'krw', label: 'South Korean Won (KRW)' },
    { value: 'sgp', label: 'Singapore Dollar (SGD)' },
    { value: 'hkd', label: 'Hong Kong Dollar (HKD)' },
    { value: 'nzd', label: 'New Zealand Dollar (NZD)' },
    { value: 'try', label: 'Turkish Lira (TRY)' },
    { value: 'thb', label: 'Thai Baht (THB)' },
    { value: 'idr', label: 'Indonesian Rupiah (IDR)' },
    { value: 'myr', label: 'Malaysian Ringgit (MYR)' },
    { value: 'aed', label: 'Emirati Dirham (AED)' },
    { value: 'sar', label: 'Saudi Riyal (SAR)' },
    { value: 'ils', label: 'Israeli Shekel (ILS)' },
    { value: 'ars', label: 'Argentine Peso (ARS)' },
    { value: 'clp', label: 'Chilean Peso (CLP)' },
    { value: 'cop', label: 'Colombian Peso (COP)' },
    { value: 'pen', label: 'Peruvian Sol (PEN)' },
    { value: 'vnd', label: 'Vietnamese Dong (VND)' },
    { value: 'pkr', label: 'Pakistani Rupee (PKR)' },
    { value: 'egp', label: 'Egyptian Pound (EGP)' },
    { value: 'ngn', label: 'Nigerian Naira (NGN)' },
    { value: 'kes', label: 'Kenyan Shilling (KES)' },
    { value: 'ghs', label: 'Ghanaian Cedi (GHS)' },
    { value: 'btc', label: 'Bitcoin (BTC)' },
    { value: 'eth', label: 'Ethereum (ETH)' },
    { value: 'xau', label: 'Gold Ounce (XAU)' },
    { value: 'xag', label: 'Silver Ounce (XAG)' }
]

// Determine symbol dynamically or just fallback to generic $ if not common
const getSymbol = (code: string) => {
    const map: Record<string, string> = { usd: '$', eur: '€', gbp: '£', jpy: '¥', inr: '₹', cny: '¥', btc: '₿', eth: 'Ξ', chf: 'Fr' }
    return map[code] || '$' // generic fallback
}

// Reusable styling for all react-select dropdowns in the app
export const customSelectStyles = {
    control: (base: any, state: any) => ({
        ...base,
        minHeight: '48px',
        backgroundColor: '#f8fafc', // bg-dark-50
        borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0', // brand-500 or dark-200
        borderRadius: '0.75rem', // rounded-xl
        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1'
        },
        cursor: 'pointer',
    }),
    singleValue: (base: any) => ({
        ...base,
        color: '#0f172a', // text-dark-900
        fontWeight: '600',
        fontSize: '0.875rem' // text-sm
    }),
    input: (base: any) => ({
        ...base,
        color: '#0f172a',
        fontWeight: '600',
        fontSize: '0.875rem'
    }),
    placeholder: (base: any) => ({
        ...base,
        color: '#64748b', // text-dark-500
        fontWeight: '500',
        fontSize: '0.875rem'
    }),
    menu: (base: any) => ({
        ...base,
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        overflow: 'hidden',
        zIndex: 50
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#3b82f6' // brand-500
            : state.isFocused
                ? '#f1f5f9' // dark-100 hover
                : 'white',
        color: state.isSelected ? 'white' : '#1e293b',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: state.isSelected ? '600' : '500',
        padding: '10px 16px',
        '&:active': {
            backgroundColor: '#2563eb' // brand-600
        }
    })
}

interface CurrencyConverterProps {
    embedded?: boolean;
    initialFrom?: string;
    initialTo?: string;
}

export default function CurrencyConverter({ embedded = false, initialFrom = 'usd', initialTo = 'inr' }: CurrencyConverterProps) {
    const [amount, setAmount] = useState<string>('1')
    const [fromCurrency, setFromCurrency] = useState(initialFrom)
    const [toCurrency, setToCurrency] = useState(initialTo)
    const [timeframe, setTimeframe] = useState<number>(30)

    const { rates, lastUpdate, loading, error } = useCurrencyRates(fromCurrency)

    const convertedVal = useMemo(() => {
        if (!amount || isNaN(Number(amount))) return ''
        if (loading || !rates || Object.keys(rates).length === 0) return 'Loading...'
        const rate = rates[toCurrency]
        if (!rate) return 'N/A'

        const result = Number(amount) * rate
        // Heuristic: If it's crypto and a tiny number, show more precision
        if (result < 0.1 && (toCurrency === 'btc' || toCurrency === 'eth')) {
            return result.toPrecision(5)
        }
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(result)
    }, [amount, rates, toCurrency, loading])

    const [chartData, setChartData] = useState<{ date: string, rate: number }[]>([])
    const [chartLoading, setChartLoading] = useState(false)

    useEffect(() => {
        let isMounted = true

        const fetchHistoricalData = async () => {
            if (!rates || !rates[toCurrency]) return
            setChartLoading(true)

            try {
                // Determine step size based on timeframe to limit requests
                const step = timeframe <= 7 ? 1 : timeframe <= 30 ? 3 : timeframe <= 90 ? 7 : 30

                const promises = []
                const dates: string[] = []
                const now = new Date()

                for (let i = timeframe; i > 0; i -= step) {
                    const d = new Date(now)
                    d.setDate(d.getDate() - i)

                    const year = d.getFullYear()
                    const month = String(d.getMonth() + 1).padStart(2, '0')
                    const day = String(d.getDate()).padStart(2, '0')
                    const dateStr = `${year}-${month}-${day}`

                    dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

                    promises.push(
                        fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/${fromCurrency}.json`)
                            .then(res => res.ok ? res.json() : null)
                            .catch(() => null)
                    )
                }

                const results = await Promise.all(promises)

                if (isMounted) {
                    const data = []
                    for (let i = 0; i < results.length; i++) {
                        const res = results[i]
                        if (res && res[fromCurrency] && res[fromCurrency][toCurrency]) {
                            data.push({
                                date: dates[i],
                                rate: Number(res[fromCurrency][toCurrency].toFixed(4))
                            })
                        }
                    }

                    // Add current live rate as the latest data point
                    data.push({
                        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        rate: Number(rates[toCurrency].toFixed(4))
                    })

                    setChartData(data)
                }
            } catch (err) {
                console.error('Failed to fetch historical data for chart', err)
            } finally {
                if (isMounted) setChartLoading(false)
            }
        }

        fetchHistoricalData()

        return () => {
            isMounted = false
        }
    }, [fromCurrency, toCurrency, timeframe, rates])

    const handleSwap = () => {
        setFromCurrency(toCurrency)
        setToCurrency(fromCurrency)
    }

    return (
        <div className="w-full flex flex-col items-center">
            <div className={`w-full flex flex-col items-center ${embedded ? 'pt-2 pb-4 px-4' : 'min-h-[calc(100vh-140px)] pt-16 pb-16 px-4'}`}>

                {!embedded && (
                    <div className="w-full mb-8 flex flex-col items-center text-center">
                        <div className="inline-flex items-center justify-center mb-4">
                            <img src="/favicon.svg" alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-dark-900 tracking-tight mb-2">
                            convertfiles.app
                        </h1>
                        <p className="text-xl font-semibold text-brand-500 mb-2">
                            Currency Converter
                        </p>
                        <p className="text-base text-dark-500 max-w-sm">
                            Live exchange rates and 30-day historical trends.
                        </p>
                    </div>
                )}

                <div className="w-full max-w-3xl space-y-4">

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 text-center font-medium animate-slide-up">
                            {error}
                        </div>
                    )}

                    {/* Main Converter Tool */}
                    <div className="bg-white border border-dark-200 rounded-2xl shadow-sm p-6 md:p-8 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">

                            {/* FROM */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-wider">Amount</label>
                                <div className="flex flex-col gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-dark-400 text-xl font-medium">
                                            {getSymbol(fromCurrency)}
                                        </div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="1.00"
                                            className="w-full text-3xl font-bold bg-transparent border-0 border-b-2 border-dark-200 focus:border-brand-500 focus:ring-0 p-2 pl-9 transition-colors"
                                        />
                                    </div>
                                    <div className="relative mt-2">
                                        <Select
                                            value={ALL_CURRENCIES.find(c => c.value === fromCurrency)}
                                            onChange={(opt: any) => setFromCurrency(opt.value)}
                                            options={ALL_CURRENCIES}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SWAP BUTTON */}
                            <div className="flex justify-center md:pt-8 w-[48px] mx-auto md:mx-0">
                                <button
                                    onClick={handleSwap}
                                    className="w-12 h-12 rounded-full bg-brand-50 hover:bg-brand-100 flex items-center justify-center text-brand-600 transition-colors shadow-sm cursor-pointer border border-brand-200 group"
                                    aria-label="Swap currencies"
                                >
                                    <ArrowRightLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>

                            {/* TO */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-wider">Converted</label>
                                <div className="flex flex-col gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-0 pointer-events-none text-brand-500 text-xl font-medium">
                                            {getSymbol(toCurrency)}
                                        </div>
                                        <input
                                            type="text"
                                            value={convertedVal}
                                            readOnly
                                            className={`w-full text-3xl font-bold bg-transparent border-0 border-b-2 border-dark-100 focus:ring-0 p-2 pl-6 pointer-events-none ${loading ? 'text-dark-300' : 'text-brand-600'}`}
                                        />
                                    </div>
                                    <div className="relative mt-2">
                                        <Select
                                            value={ALL_CURRENCIES.find(c => c.value === toCurrency)}
                                            onChange={(opt: any) => setToCurrency(opt.value)}
                                            options={ALL_CURRENCIES}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!loading && lastUpdate && (
                            <div className="mt-6 flex justify-between items-center text-xs text-dark-400 pt-4 border-t border-dark-50">
                                <span>1 {fromCurrency.toUpperCase()} = {rates[toCurrency]} {toCurrency.toUpperCase()}</span>
                                <span>Live mid-market rate as of {lastUpdate}</span>
                            </div>
                        )}
                    </div>

                    {/* Chart Panel */}
                    {!loading && chartData.length > 0 && (
                        <div className="bg-white border border-dark-200 rounded-2xl shadow-sm p-6 animate-slide-up relative">
                            {chartLoading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 rounded-2xl flex items-center justify-center">
                                    <div className="text-brand-500 font-medium flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                        Updating Chart...
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                                <h3 className="text-sm font-bold text-dark-700 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-brand-500" />
                                    {timeframe === 365 ? '1-Year' : `${timeframe}-Day`} Trend: {fromCurrency.toUpperCase()} to {toCurrency.toUpperCase()}
                                </h3>
                                <div className="flex items-center gap-1 bg-dark-50 p-1 rounded-lg border border-dark-100">
                                    {[7, 30, 90, 365].map(days => (
                                        <button
                                            key={days}
                                            onClick={() => setTimeframe(days)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${timeframe === days
                                                ? 'bg-white text-dark-900 shadow-sm border border-dark-200'
                                                : 'text-dark-500 hover:text-dark-900 hover:bg-dark-100'
                                                }`}
                                        >
                                            {days === 365 ? '1Y' : `${days}D`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            domain={['auto', 'auto']}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            tickFormatter={(val) => Number.isInteger(val) ? val : val.toFixed(2)}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                                            formatter={(value: any) => [value, 'Rate']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="rate"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!embedded && <RelatedTools currentTool="currency" />}

            {!embedded && <GenericSEOContent toolId="currency" />}

            {!embedded && (
                <div className="w-full">
                    <Features />
                </div>
            )}
        </div>
    )
}
