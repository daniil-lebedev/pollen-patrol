import React, {useState, useEffect} from 'react';
import useSWR from 'swr';
import axios from 'axios';
import {AlertTriangle, ThumbsUp, Flower2} from 'lucide-react';
import getUserLocation from "../scripts/get_location.js";
import {Alert, AlertTitle, Typography} from '@mui/material';
import {Card, CardContent, CardHeader} from '@mui/material';

const fetcher = url => axios.get(url).then(res => res.data);
const pollenApiKey = process.env.NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY;

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

    const url = location
        ? `https://pollen.googleapis.com/v1/forecast:lookup?key=${pollenApiKey}&location.latitude=${location.latitude}&location.longitude=${location.longitude}&days=1`
        : null;

    const {data, error: swrError} = useSWR(url, fetcher);

    if (isLoading) return <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
    if (!data) return <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;

    const pollenInfo = data.dailyInfo[0];
    const maxPollenLevel = Math.max(...pollenInfo.pollenTypeInfo.map(type => type.indexInfo.value));
    const overallStatus = maxPollenLevel <= 2 ? "Low" : maxPollenLevel <= 4 ? "Moderate" : "High";

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Pollen Patrol</h1>

            <Card className="mb-6">
                <CardHeader>
                    <Typography variant="h4">Pollen Forecast</Typography>
                </CardHeader>
                <CardContent>
                    {overallStatus === "Low" && <ThumbsUp className="text-green-500"/>}
                    {overallStatus === "Moderate" && <AlertTriangle className="text-yellow-500"/>}
                    {overallStatus === "High" && <AlertTriangle className="text-red-500"/>}
                    <p className="text-2xl font-bold">Pollen is {overallStatus} right now</p>
                    <p className="text-gray-600">Date: {`${pollenInfo.date.year}-${pollenInfo.date.month}-${pollenInfo.date.day}`}</p>
                    <p className="text-gray-600">Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pollenInfo.pollenTypeInfo.map((type, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        </CardHeader>
                        <CardContent>
                            <Flower2 className="mr-2"/>
                            <p className="text-xl font-bold mb-2">{type.displayName} Status: {type.indexInfo.category}</p>
                            <p className="mb-2">Level: {type.indexInfo.value} / 5</p>
                            <p className="text-sm text-gray-600 mb-2">{type.indexInfo.indexDescription}</p>
                            <Alert
                                variant={type.indexInfo.value <= 2 ? "default" : type.indexInfo.value <= 4 ? "warning" : "destructive"}>
                                <p>{type.healthRecommendations[0]}</p>
                            </Alert>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">Plants in Your Area</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pollenInfo.plantInfo.filter(plant => plant.plantDescription).map((plant, index) => (
                    <Card key={index} className="overflow-hidden">
                        <img src={plant.plantDescription.picture} alt={plant.displayName}
                             className="w-full h-48 object-cover"/>
                        <CardContent className="p-4">
                            <h3 className="text-xl font-bold mb-2">{plant.displayName}</h3>
                            <p className="text-sm text-gray-600 mb-1">Type: {plant.plantDescription.type}</p>
                            <p className="text-sm text-gray-600 mb-1">Season: {plant.plantDescription.season}</p>
                            <p className="text-sm text-gray-600">{plant.inSeason ? 'Currently in Season' : 'Out of Season'}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}