import { useState, useMemo, useEffect } from 'react'
import SEOHead from '../components/SEOHead'
import { SITE_URL } from '../lib/seoConversionData'
import { convert } from 'convert'
import { Search, ArrowRightLeft, Ruler, Scale, Droplet, Thermometer, Database } from 'lucide-react'
import Select from 'react-select'
import Features from '@/components/Features';
import RelatedTools from '@/components/RelatedTools';
import GenericSEOContent from '@/components/GenericSEOContent';
import { TextRoll } from '@/components/ui/text-roll';

export const customSelectStyles = {
    control: (base: any, state: any) => ({
        ...base,
        minHeight: '48px',
        backgroundColor: '#f8fafc',
        borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
        borderRadius: '0.75rem',
        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1'
        },
        cursor: 'pointer',
    }),
    singleValue: (base: any) => ({
        ...base,
        color: '#0f172a',
        fontWeight: '600',
        fontSize: '0.875rem'
    }),
    input: (base: any) => ({
        ...base,
        color: '#0f172a',
        fontWeight: '600',
        fontSize: '0.875rem'
    }),
    placeholder: (base: any) => ({
        ...base,
        color: '#64748b',
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
            ? '#3b82f6'
            : state.isFocused
                ? '#f1f5f9'
                : 'white',
        color: state.isSelected ? 'white' : '#1e293b',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: state.isSelected ? '600' : '500',
        padding: '10px 16px',
        '&:active': {
            backgroundColor: '#2563eb'
        }
    })
}

// We will use the 'convert' package's comprehensive unit list.
// Organize them into helpful categories.
type UnitCategory = 'length' | 'mass' | 'volume' | 'temperature' | 'data' | 'all'

const CATEGORY_ICONS: Record<UnitCategory, React.ReactNode> = {
    length: <Ruler className="w-5 h-5" />,
    mass: <Scale className="w-5 h-5" />,
    volume: <Droplet className="w-5 h-5" />,
    temperature: <Thermometer className="w-5 h-5" />,
    data: <Database className="w-5 h-5" />,
    all: <Search className="w-5 h-5" />,
}

// Map some of our common units to the `convert` library's exact string expectations
const COMMON_UNITS = [
    // Length
    { val: 'km', label: 'Kilometers', cat: 'length' },
    { val: 'm', label: 'Meters', cat: 'length' },
    { val: 'cm', label: 'Centimeters', cat: 'length' },
    { val: 'mm', label: 'Millimeters', cat: 'length' },
    { val: 'mi', label: 'Miles', cat: 'length' },
    { val: 'yd', label: 'Yards', cat: 'length' },
    { val: 'ft', label: 'Feet', cat: 'length' },
    { val: 'in', label: 'Inches', cat: 'length' },

    // Mass
    { val: 'kg', label: 'Kilograms', cat: 'mass' },
    { val: 'g', label: 'Grams', cat: 'mass' },
    { val: 'mg', label: 'Milligrams', cat: 'mass' },
    { val: 'lb', label: 'Pounds', cat: 'mass' },
    { val: 'oz', label: 'Ounces', cat: 'mass' },
    { val: 'mt', label: 'Metric Tonnes', cat: 'mass' },

    // Volume
    { val: 'l', label: 'Liters', cat: 'volume' },
    { val: 'ml', label: 'Milliliters', cat: 'volume' },
    { val: 'gal', label: 'Gallons (US)', cat: 'volume' },
    { val: 'qt', label: 'Quarts (US)', cat: 'volume' },
    { val: 'pt', label: 'Pints (US)', cat: 'volume' },
    { val: 'cup', label: 'Cups (US)', cat: 'volume' },
    { val: 'floz', label: 'Fluid Ounces (US)', cat: 'volume' },

    // Temperature
    { val: 'C', label: 'Celsius', cat: 'temperature' },
    { val: 'F', label: 'Fahrenheit', cat: 'temperature' },
    { val: 'K', label: 'Kelvin', cat: 'temperature' },

    // Data
    { val: 'B', label: 'Bytes', cat: 'data' },
    { val: 'KB', label: 'Kilobytes', cat: 'data' },
    { val: 'MB', label: 'Megabytes', cat: 'data' },
    { val: 'GB', label: 'Gigabytes', cat: 'data' },
    { val: 'TB', label: 'Terabytes', cat: 'data' },
]

interface UnitConverterProps {
    embedded?: boolean;
    initialFrom?: string;
    initialTo?: string;
    initialCategory?: UnitCategory;
}

export default function UnitConverter({ embedded = false, initialFrom = 'm', initialTo = 'ft', initialCategory = 'length' }: UnitConverterProps) {
    const [activeCategory, setActiveCategory] = useState<UnitCategory>(initialCategory)
    const [searchQuery, setSearchQuery] = useState('')

    const [fromVal, setFromVal] = useState<string>('1')
    const [fromUnit, setFromUnit] = useState<string>(initialFrom)

    const [toVal, setToVal] = useState<string>('')
    const [toUnit, setToUnit] = useState<string>(initialTo)

    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    // Derived list of units based on search / category
    const availableUnits = useMemo(() => {
        let filtered = COMMON_UNITS
        if (activeCategory !== 'all') {
            filtered = filtered.filter(u => u.cat === activeCategory)
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            filtered = COMMON_UNITS.filter(u =>
                u.label.toLowerCase().includes(q) || u.val.toLowerCase().includes(q)
            )
        }
        return filtered
    }, [activeCategory, searchQuery])

    // Ensure our selected units are valid when filtering changes
    useEffect(() => {
        if (availableUnits.length > 0) {
            // If active category changes, and current unit isn't in it, pick the first one
            if (!availableUnits.find(u => u.val === fromUnit)) {
                setFromUnit(availableUnits[0].val)
            }
            if (!availableUnits.find(u => u.val === toUnit)) {
                setToUnit(availableUnits.length > 1 ? availableUnits[1].val : availableUnits[0].val)
            }
        }
    }, [activeCategory, availableUnits])

    // Perform Conversion
    useEffect(() => {
        setErrorMsg(null)
        if (!fromVal) {
            setToVal('')
            return
        }

        const num = parseFloat(fromVal)
        if (isNaN(num)) {
            setToVal('')
            return
        }

        try {
            // @ts-ignore - 'convert' has many overloads and types, we catch runtimes below
            const c: any = convert;
            const result = c(num, fromUnit).to(toUnit)

            // Format nicely: limit absurd decimals if necessary
            let formatted = result
            if (typeof result === 'number') {
                formatted = Number.isInteger(result) ? result : parseFloat(result.toPrecision(7))
            }
            setToVal(String(formatted))
        } catch (e: any) {
            console.warn("Conversion Error:", e)
            setErrorMsg("Units incompatible. Please pick units of the same type.")
            setToVal('-')
        }
    }, [fromVal, fromUnit, toUnit])

    const handleSwap = () => {
        setFromUnit(toUnit)
        setToUnit(fromUnit)
        setFromVal(toVal === '-' ? '1' : toVal)
    }

    return (
        <div className="w-full flex flex-col items-center">
            <SEOHead
                title="Free Unit Converter — Length, Mass, Volume, Temp & Data | convertfiles.app"
                description="Instantly convert between units of length, mass, volume, temperature, and digital data. Precision-engineered offline conversion tool."
                canonical={`${SITE_URL}/units`}
                keywords={['unit converter', 'convert units', 'length converter', 'mass converter', 'temperature converter']}
            />
            <div className={`w-full flex flex-col items-center ${embedded ? 'pt-2 pb-4 px-4' : 'min-h-[calc(100vh-140px)] pt-16 pb-16 px-4'}`}>

                {!embedded && (
                    <div className="w-full mb-8 flex flex-col items-center text-center">
                        <div className="inline-flex items-center justify-center mb-4">
                            <img src="/favicon.svg" alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                        <h1
                            className="text-4xl md:text-5xl font-bold text-dark-900 tracking-tight mb-2"
                        >
                            <TextRoll>
                                convertfiles.app
                            </TextRoll>
                        </h1>
                        <p className="text-xl font-semibold text-brand-500 mb-2">
                            Unit Converter
                        </p>
                        <p className="text-base text-dark-500 max-w-sm">
                            Instantly convert length, mass, volume, temperature, and data offline.
                        </p>
                    </div>
                )}

                <div className="w-full max-w-3xl bg-white border border-dark-200 rounded-2xl shadow-sm p-6 md:p-8 animate-slide-up space-y-8">

                    {/* Categories and Search */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-dark-100 pb-6">
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            {(['length', 'mass', 'volume', 'temperature', 'data'] as UnitCategory[]).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => { setActiveCategory(cat); setSearchQuery('') }}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border
                                        ${activeCategory === cat && !searchQuery
                                            ? 'bg-dark-900 text-white border-dark-900 shadow-md'
                                            : 'bg-white text-dark-500 border-dark-200 hover:border-dark-300 hover:bg-dark-50'
                                        }`}
                                >
                                    {CATEGORY_ICONS[cat]}
                                    <span className="capitalize">{cat}</span>
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            <input
                                type="text"
                                placeholder="Search units..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Main Converter Tool */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">

                        {/* FROM */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-dark-400 uppercase tracking-wider">From</label>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="number"
                                    value={fromVal}
                                    onChange={(e) => setFromVal(e.target.value)}
                                    placeholder="Enter value"
                                    className="w-full text-3xl font-bold bg-transparent border-0 border-b-2 border-dark-200 focus:border-brand-500 focus:ring-0 p-2 pl-0 transition-colors"
                                />
                                <div className="relative z-20">
                                    <Select
                                        value={availableUnits.map(u => ({ value: u.val, label: `${u.label} (${u.val})` })).find(o => o.value === fromUnit) || null}
                                        onChange={(opt: any) => setFromUnit(opt.value)}
                                        options={availableUnits.map(u => ({ value: u.val, label: `${u.label} (${u.val})` }))}
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
                                aria-label="Swap units"
                            >
                                <ArrowRightLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* TO */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-dark-400 uppercase tracking-wider">To</label>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    value={toVal}
                                    readOnly
                                    placeholder="Result"
                                    className="w-full text-3xl font-bold bg-transparent border-0 border-b-2 border-dark-100 text-dark-900 focus:ring-0 p-2 pl-0 pointer-events-none"
                                />
                                <div className="relative z-10">
                                    <Select
                                        value={availableUnits.map(u => ({ value: u.val, label: `${u.label} (${u.val})` })).find(o => o.value === toUnit) || null}
                                        onChange={(opt: any) => setToUnit(opt.value)}
                                        options={availableUnits.map(u => ({ value: u.val, label: `${u.label} (${u.val})` }))}
                                        styles={customSelectStyles}
                                        isSearchable={true}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {errorMsg && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 text-center font-medium animate-slide-up">
                            {errorMsg}
                        </div>
                    )}
                </div>

                {!embedded && (
                    <p className="text-center text-xs text-dark-400 mt-6 max-w-lg mb-12">
                        Conversion is performed mathematically offline right in your browser. Precision-engineered formulas ensure pinpoint accuracy. No API calls or tracking.
                    </p>
                )}
            </div>

            {!embedded && <RelatedTools currentTool="units" />}

            {!embedded && <GenericSEOContent toolId="units" />}

            {!embedded && (
                <div className="w-full">
                    <Features />
                </div>
            )}
        </div>
    )
}
