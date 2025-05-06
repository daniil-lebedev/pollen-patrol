import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { AlertCircle, ThumbsUp, Flower2, Calendar } from 'lucide-react';
import getUserLocation from '../scripts/get_location'; // Ensure this path is correct

const fetcher = url => fetch(url).then(res => res.json());

export default function PollenInfo() {
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Fetching user location...");
        getUserLocation()
            .then(loc => {
                console.log("Location fetched:", loc);
                setLocation(loc);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error getting location:", err);
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
        if (value <= 2) return { text: 'Low Risk', icon: ThumbsUp, color: 'text-green-500' };
        if (value <= 4) return { text: 'Moderate Risk', icon: AlertCircle, color: 'text-yellow-500' };
        return { text: 'High Risk', icon: AlertCircle, color: 'text-red-500' };
    };

    // Calculate overall pollen risk
    const maxPollenValue = pollenInfo?.pollenTypeInfo
        ? Math.max(...pollenInfo.pollenTypeInfo
            .map(p => p?.indexInfo?.value || 0) // Default to 0 if indexInfo or value is missing
        )
        : 0;

    const riskInfo = getRiskLevel(maxPollenValue);
    const RiskIcon = riskInfo.icon;

    if (error || swrError) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="p-6 text-center bg-red-50 rounded-lg shadow-sm">
                    <p className="text-red-600">Unable to load pollen data: {error || swrError.message}</p>
                </div>
            </div>
        );
    }

    if (isLoading || !pollenInfo) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-light mb-2">Pollen Report</h1>
                <div className="text-sm text-gray-500">
                    <Calendar className="inline-block w-4 h-4 mr-1" />
                    {new Date(pollenInfo.date.year, pollenInfo.date.month - 1, pollenInfo.date.day).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {/* Pollen Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <RiskIcon className={`w-6 h-6 ${riskInfo.color}`} />
                        <span className={`text-xl font-medium ${riskInfo.color}`}>{riskInfo.text}</span>
                    </div>
                    <p className="text-gray-600">Overall pollen risk is {riskInfo.text.toLowerCase()} today.</p>
                </div>

                {/* Pollen Types */}
                <div className="mt-6 space-y-4">
                    {pollenInfo.pollenTypeInfo?.map((type, index) => {
                        const pollenValue = type.indexInfo?.value || 0;
                        const pollenColor = getRiskLevel(pollenValue).color.replace('text', 'bg');
                        const pollenCategory = type.indexInfo?.category || 'N/A';
                        const pollenDescription = type.indexInfo?.indexDescription || 'No description available.';

                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Flower2 className="w-5 h-5 text-blue-500" />
                                        <span className="font-medium">{type.displayName}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">{pollenCategory}</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100">
                                    <div
                                        className={`h-full rounded-full ${pollenColor}`}
                                        style={{ width: `${(pollenValue / 5) * 100}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600">{pollenDescription}</p>
                                {type.healthRecommendations?.map((recommendation, i) => (
                                    <div key={i} className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                        {recommendation}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Plants in Your Area */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Plants in Your Area</h2>
                <div className="space-y-4">
                    {pollenInfo.plantInfo?.map((plant, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2">
                                {plant.plantDescription?.picture && (
                                    <img
                                        src={plant.plantDescription.picture}
                                        alt={plant.displayName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                )}
                                <div>
                                    <h3 className="font-medium">{plant.displayName}</h3>
                                    <p className="text-sm text-gray-600">{plant.plantDescription?.type || 'N/A'}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">{plant.plantDescription?.season || 'No seasonal data.'}</p>
                            <p className="text-sm text-gray-600">{plant.inSeason ? 'Currently in Season' : 'Out of Season'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}