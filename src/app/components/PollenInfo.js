import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { 
  AlertCircle, 
  ThumbsUp, 
  Flower2, 
  Calendar, 
  MapPin, 
  BarChart3,
  Info,
  ChevronDown,
  ChevronUp,
  Wind
} from 'lucide-react';
import Image from 'next/image';
import getUserLocation from '../scripts/get_location';

const fetcher = url => fetch(url).then(res => res.json());

export default function PollenInfo() {
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPlant, setExpandedPlant] = useState(null);

    useEffect(() => {
        getUserLocation()
            .then(loc => {
                setLocation(loc);
                setIsLoading(false);
            })
            .catch(err => {
                setError("Failed to get location: " + err.message);
                setIsLoading(false);
            });
    }, []);

    const pollenApiKey = process.env.NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY;
    const url = location
        ? `https://pollen.googleapis.com/v1/forecast:lookup?key=${pollenApiKey}&location.latitude=${location.latitude}&location.longitude=${location.longitude}&days=1`
        : null;

    const { data, error: swrError } = useSWR(url, fetcher);
    const pollenInfo = data?.dailyInfo?.[0];

    const getRiskLevel = (value) => {
        if (value <= 2) return { text: 'Low Risk', icon: ThumbsUp, color: 'text-green-500', bgColor: 'bg-green-500', lightBg: 'bg-green-50' };
        if (value <= 4) return { text: 'Moderate Risk', icon: AlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-500', lightBg: 'bg-yellow-50' };
        return { text: 'High Risk', icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500', lightBg: 'bg-red-50' };
    };

    // Calculate overall pollen risk
    const maxPollenValue = pollenInfo?.pollenTypeInfo
        ? Math.max(...pollenInfo.pollenTypeInfo
            .map(p => p?.indexInfo?.value || 0)
        )
        : 0;

    const riskInfo = getRiskLevel(maxPollenValue);
    const RiskIcon = riskInfo.icon;

    const togglePlantExpansion = (index) => {
        if (expandedPlant === index) {
            setExpandedPlant(null);
        } else {
            setExpandedPlant(index);
        }
    };

    if (error || swrError) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 bg-blue-50">
                <div className="p-6 text-center bg-white rounded-xl shadow-md max-w-md w-full">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-semibold mb-2">Unable to Load Data</h2>
                    <p className="text-gray-600">{error || swrError.message}</p>
                    <button 
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading || !pollenInfo) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-blue-50">
                <div className="text-center p-8">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-blue-600 font-medium">Loading pollen data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-16">
            {/* Header */}
            <div className="bg-white shadow-md mb-6">
                <div className="max-w-4xl mx-auto p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-1">Pollen Report</h1>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                                <Calendar className="inline-block w-4 h-4 mr-1" />
                                <span>
                                    {new Date(pollenInfo.date.year, pollenInfo.date.month - 1, pollenInfo.date.day).toLocaleDateString(undefined, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>

                        </div>
                        
                        <div className={`mt-4 md:mt-0 p-3 rounded-lg ${riskInfo.lightBg} flex items-center gap-2`}>
                            <div className={`p-2 rounded-full ${riskInfo.lightBg}`}>
                                <RiskIcon className={`w-6 h-6 ${riskInfo.color}`} />
                            </div>
                            <div>
                                <p className={`font-semibold ${riskInfo.color}`}>{riskInfo.text}</p>
                                <p className="text-xs text-gray-600">Overall Pollen Level</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 space-y-6">
                {/* Pollen Types Panel */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-blue-600 text-white p-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">Pollen Levels by Type</h2>
                        </div>
                    </div>
                    
                    <div className="p-4 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pollenInfo.pollenTypeInfo?.filter(type => type.indexInfo && type.indexInfo.category !== 'N/A').map((type, index) => {
                                const pollenValue = type.indexInfo?.value || 0;
                                const risk = getRiskLevel(pollenValue);
                                const pollenCategory = type.indexInfo?.category || 'N/A';
                                const pollenDescription = type.indexInfo?.indexDescription || 'No description available.';

                                return (
                                    <div key={index} className="border rounded-lg overflow-hidden">
                                        <div className={`p-3 ${risk.lightBg} border-b flex justify-between items-center`}>
                                            <div className="flex items-center gap-2">
                                                <Flower2 className={`w-5 h-5 ${risk.color}`} />
                                                <span className="font-medium">{type.displayName}</span>
                                            </div>
                                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${risk.lightBg} ${risk.color}`}>
                                                {pollenCategory}
                                            </span>
                                        </div>
                                        
                                        <div className="p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex-grow h-2 rounded-full bg-gray-100">
                                                    <div
                                                        className={`h-full rounded-full ${risk.bgColor}`}
                                                        style={{ width: `${(pollenValue / 5) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{pollenValue}/5</span>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 mb-3">{pollenDescription}</p>
                                            
                                            {type.healthRecommendations?.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-blue-700">Recommendations:</p>
                                                    {type.healthRecommendations?.map((recommendation, i) => (
                                                        <div key={i} className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg flex items-start">
                                                            <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                                            <p>{recommendation}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Plants in Area Panel */}
                {pollenInfo.plantInfo?.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="bg-green-600 text-white p-4">
                            <div className="flex items-center gap-2">
                                <Wind className="w-5 h-5" />
                                <h2 className="text-lg font-semibold">Plants in Your Area</h2>
                            </div>
                        </div>
                        
                        <ul className="divide-y">
                            {pollenInfo.plantInfo?.map((plant, index) => (
                                <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                    <button 
                                        className="w-full text-left"
                                        onClick={() => togglePlantExpansion(index)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {plant.plantDescription?.picture ? (
                                                    <Image
                                                        src={plant.plantDescription.picture}
                                                        alt={plant.displayName}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full object-cover border-2 border-green-100"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <Flower2 className="w-6 h-6 text-green-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-medium">{plant.displayName}</h3>
                                                    <p className="text-sm text-gray-600">{plant.plantDescription?.type || 'N/A'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <span className={`mr-2 text-sm px-2 py-1 rounded-full ${plant.inSeason ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {plant.inSeason ? 'In Season' : 'Out of Season'}
                                                </span>
                                                {expandedPlant === index ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                    
                                    {expandedPlant === index && (
                                        <div className="mt-3 ml-12 text-sm text-gray-600 space-y-2">
                                            {plant.plantDescription?.season && (
                                                <p><span className="font-medium">Season: </span>{plant.plantDescription.season}</p>
                                            )}
                                            {plant.plantDescription?.description && (
                                                <p>{plant.plantDescription.description}</p>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}