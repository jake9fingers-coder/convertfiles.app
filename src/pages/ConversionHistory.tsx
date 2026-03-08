import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import { SITE_URL } from '../lib/seoConversionData'
import ConversionHistoryList from '../components/ConversionHistoryList'
import {
    loadVideoHistory, saveVideoHistory,
    loadImageHistory, saveImageHistory,
    loadDataHistory, saveDataHistory,
    loadDocumentHistory, saveDocumentHistory
} from '../lib/db'
import { PROFILES } from '../lib/conversionProfiles'
import { IMAGE_PROFILES } from '../lib/imageConversionProfiles'
import { DATA_PROFILES } from '../lib/dataConversionProfiles'
import { DOCUMENT_PROFILES } from '../lib/documentConversionProfiles'
import { ChevronLeft, ChevronRight, FileVideo, Image as ImageIcon, FileText, LayoutList } from 'lucide-react'

type TabType = 'video' | 'image' | 'document' | 'data'

const TABS: { id: TabType, label: string, icon: any }[] = [
    { id: 'video', label: 'Video', icon: FileVideo },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'document', label: 'Document', icon: FileText },
    { id: 'data', label: 'Data', icon: LayoutList },
]

const ITEMS_PER_PAGE = 20

export default function ConversionHistory() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const initialTab = (searchParams.get('type') as TabType) || 'video'
    const [activeTab, setActiveTab] = useState<TabType>(TABS.some(t => t.id === initialTab) ? initialTab : 'video')

    const [historyData, setHistoryData] = useState<Record<TabType, any[]>>({
        video: [],
        image: [],
        document: [],
        data: []
    })

    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const loadAllHistory = async () => {
            const [video, image, data, document] = await Promise.all([
                loadVideoHistory(),
                loadImageHistory(),
                loadDataHistory(),
                loadDocumentHistory()
            ])
            setHistoryData({ video, image, data, document })
        }
        loadAllHistory()
    }, [])

    const handleTabChange = (tabId: TabType) => {
        setActiveTab(tabId)
        setCurrentPage(1)
        navigate(`/history?type=${tabId}`, { replace: true })
    }

    const handleRemove = (id: string) => {
        const newArray = historyData[activeTab].filter((i: any) => i.id !== id)
        setHistoryData(prev => ({ ...prev, [activeTab]: newArray }))
        saveCurrentHistory(activeTab, newArray)
    }

    const handleClearAll = () => {
        setHistoryData(prev => ({ ...prev, [activeTab]: [] }))
        saveCurrentHistory(activeTab, [])
        setCurrentPage(1)
    }

    const saveCurrentHistory = (type: TabType, data: any[]) => {
        if (type === 'video') saveVideoHistory(data)
        if (type === 'image') saveImageHistory(data)
        if (type === 'data') saveDataHistory(data)
        if (type === 'document') saveDocumentHistory(data)
    }

    const handleReuse = (_item: any) => {
        // Simple redirect to origin page with query params ideally, 
        // but for now redirecting to the tool is fine.
        if (activeTab === 'video') navigate('/')
        if (activeTab === 'image') navigate('/image-converter')
        if (activeTab === 'data') navigate('/data-converter')
        if (activeTab === 'document') navigate('/document-converter') // (Or whatever the route actually is for doc converter)
    }

    const getProfile = (mode: string) => {
        if (activeTab === 'video') return PROFILES[mode as keyof typeof PROFILES]
        if (activeTab === 'image') return IMAGE_PROFILES[mode as keyof typeof IMAGE_PROFILES]
        if (activeTab === 'data') return DATA_PROFILES[mode as keyof typeof DATA_PROFILES]
        if (activeTab === 'document') return DOCUMENT_PROFILES[mode as keyof typeof DOCUMENT_PROFILES]
        return null
    }

    const currentHistoryList = historyData[activeTab]
    const totalPages = Math.max(1, Math.ceil(currentHistoryList.length / ITEMS_PER_PAGE))
    const paginatedHistory = currentHistoryList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    return (
        <div className="w-full flex flex-col items-center min-h-[calc(100vh-140px)] pt-16 pb-16 px-4">
            <SEOHead
                title="Full Conversion History | convertfiles.app"
                description="View your offline conversion history for all processed files."
                canonical={`${SITE_URL}/history`}
            />

            <div className="w-full max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-dark-900 tracking-tight mb-2">
                        Conversion History
                    </h1>
                    <p className="text-base text-dark-500">
                        View and manage your recent local conversions
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-dark-50 rounded-xl border border-dark-200 shadow-sm w-fit mx-auto">
                    {TABS.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as TabType)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive
                                    ? 'bg-white text-brand-600 shadow border border-dark-200'
                                    : 'text-dark-600 hover:text-dark-900 hover:bg-dark-100/50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-dark-100 text-dark-500 text-xs font-medium">
                                    {historyData[tab.id as TabType].length}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* List container */}
                <div className="relative">
                    {currentHistoryList.length === 0 ? (
                        <div className="py-20 text-center text-dark-400">
                            <p className="text-lg font-medium mb-1">No history found</p>
                            <p className="text-sm">Conversions you perform will appear here.</p>
                        </div>
                    ) : (
                        <>
                            <ConversionHistoryList
                                history={paginatedHistory}
                                onReuse={handleReuse}
                                onRemove={handleRemove}
                                onClearAll={handleClearAll}
                                getProfile={getProfile}
                                type={activeTab}
                                isFullHistoryPage={true}
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-dark-100">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-dark-200 rounded-lg bg-white text-dark-700 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm font-medium text-dark-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-dark-200 rounded-lg bg-white text-dark-700 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
