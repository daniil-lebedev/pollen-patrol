import {Inter} from "next/font/google";
import "./globals.css";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "Pollen Patrol",
    description: "We don't let Pollen get the best of you!",
    image: "/favicon.png",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <head>
            <title>Pollen Patrol</title>
            <link rel="icon" href="/favicon.png"/>
        </head>
        <body className={inter.className}>{children}</body>
        </html>
    )
        ;
}