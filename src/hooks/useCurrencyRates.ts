import { useState, useEffect } from 'react'

export interface CurrencyRates {
    date: string
    [currencyCode: string]: number | string
}

export function useCurrencyRates(baseCurrency: string = 'usd') {
    const [rates, setRates] = useState<Record<string, number>>({})
    const [lastUpdate, setLastUpdate] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const fetchRates = async () => {
            setLoading(true)
            setError(null)
            try {
                // Using fawazahmed0's free fallback CDN for fast decentralized rates
                const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCurrency.toLowerCase()}.json`)

                if (!response.ok) {
                    throw new Error('Failed to fetch exchange rates')
                }

                const data = await response.json()

                if (isMounted) {
                    setRates(data[baseCurrency.toLowerCase()] || {})
                    setLastUpdate(data.date)
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'Network error fetching live rates')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchRates()

        return () => {
            isMounted = false
        }
    }, [baseCurrency])

    return { rates, lastUpdate, loading, error }
}
