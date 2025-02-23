import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { Wind, Clock, Flower2, AlertCircle, ThumbsUp } from 'lucide-react';

const fetcher = url => fetch(url).then(res => res.json());

export default function PollenInfo() {
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLocation({ latitude: 37.7749, longitude: -122.4194 });
        setIsLoading(false);
    }, []);

    // Enhanced sample data
    const sampleData = {
        dailyInfo: [{
            date: { year: 2024, month: 2, day: 23 },
            pollenTypeInfo: [
                {
                    displayName: "Tree",
                    indexInfo: {
                        value: 4,
                        category: "Moderate",
                        indexDescription: "Moderate tree pollen levels may cause symptoms for sensitive individuals"
                    },
                    triggers: ["Birch", "Oak", "Pine"]
                },
                {
                    displayName: "Grass",
                    indexInfo: {
                        value: 2,
                        category: "Low",
                        indexDescription: "Low grass pollen levels unlikely to affect most individuals"
                    },
                    triggers: ["Timothy", "Bermuda"]
                },
                {
                    displayName: "Weed",
                    indexInfo: {
                        value: 1,
                        category: "Low",
                        indexDescription: "Very low weed pollen levels present"
                    },
                    triggers: ["Ragweed", "Nettle"]
                }
            ],
            riskFactors: {
                humidity: 65,
                windSpeed: 8,
                temperature: 22
            }
        }]
    };

    const { data = sampleData } = useSWR(location ? '/api/pollen' : null, null);
    const pollenInfo = data?.dailyInfo?.[0];

    const getPollenColor = (value) => {
        if (value <= 2) return 'bg-gradient-to-r from-green-400 to-green-300';
        if (value <= 4) return 'bg-gradient-to-r from-yellow-400 to-yellow-300';
        return 'bg-gradient-to-r from-red-400 to-red-300';
    };

    const getRiskLevel = (value) => {
        if (value <= 2) return { text: 'Low Risk', icon: ThumbsUp, color: 'text-green-500' };
        if (value <= 4) return { text: 'Moderate Risk', icon: AlertCircle, color: 'text-yellow-500' };
        return { text: 'High Risk', icon: AlertCircle, color: 'text-red-500' };
    };

    const maxPollenValue = Math.max(...pollenInfo.pollenTypeInfo.map(p => p.indexInfo.value));
    const riskInfo = getRiskLevel(maxPollenValue);
    const RiskIcon = riskInfo.icon;

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="p-6 text-center bg-red-50 rounded-lg shadow-sm">
                    <p className="text-red-600">Unable to load pollen data</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-light mb-2">Pollen Report</h1>
                <div className="text-sm text-gray-500">
                    <Clock className="inline-block w-4 h-4 mr-1" />
                    {new Date().toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white/30 backdrop-blur-xl shadow-lg">
                {/* Main Stats */}
                <div className="p-6 space-y-8">
                    <div className="text-center space-y-2">
                        <Wind className="w-12 h-12 mx-auto text-blue-500" />
                        <div className="text-6xl font-extralight">{maxPollenValue}</div>
                        <div className="flex items-center justify-center gap-2">
                            <RiskIcon className={`w-5 h-5 ${riskInfo.color}`} />
                            <span className={`font-medium ${riskInfo.color}`}>{riskInfo.text}</span>
                        </div>
                    </div>

                    {/* Environmental Factors */}
                    <div className="grid grid-cols-3 gap-4 text-center py-4 border-y border-gray-100">
                        <div>
                            <div className="text-gray-500 text-sm">Humidity</div>
                            <div className="text-lg font-medium">{pollenInfo.riskFactors.humidity}%</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm">Wind</div>
                            <div className="text-lg font-medium">{pollenInfo.riskFactors.windSpeed} mph</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm">Temperature</div>
                            <div className="text-lg font-medium">{pollenInfo.riskFactors.temperature}°C</div>
                        </div>
                    </div>

                    {/* Detailed Pollen Types */}
                    <div className="space-y-6">
                        {pollenInfo.pollenTypeInfo.map((type, index) => (
                            <div key={index} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Flower2 className="w-5 h-5 text-blue-500" />
                                        <span className="font-medium">{type.displayName}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">{type.indexInfo.category}</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100">
                                    <div
                                        className={`h-full rounded-full ${getPollenColor(type.indexInfo.value)}`}
                                        style={{ width: `${(type.indexInfo.value / 5) * 100}%` }}
                                    />
                                </div>
                                <div className="text-sm text-gray-600">{type.indexInfo.indexDescription}</div>
                                <div className="flex flex-wrap gap-2">
                                    {type.triggers.map((trigger, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                      {trigger}
                    </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4">
                    <div className="text-center text-sm text-gray-500">
                        Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </div>
    );
}