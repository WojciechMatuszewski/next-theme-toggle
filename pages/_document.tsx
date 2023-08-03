import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function MyDocument() {
    const setInitialThemeScript = `
        function getUserPreference() {
            if (window.localStorage.getItem('theme')) {
                return window.localStorage.getItem('theme')
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }

        const theme = getUserPreference();
        document.documentElement.setAttribute('data-theme', theme);
    `
    return (
        <Html lang="en">
            <Head />
            <body>
                <Script
                    id="theme-script"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{ __html: setInitialThemeScript }} />
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
