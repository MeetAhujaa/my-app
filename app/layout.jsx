import "./globals.css"
import AuthStatus from "./components/AuthStatus.jsx" // Import the new AuthStatus component

export const metadata = {
  title: "CryptoTracker",
  description: "Track cryptocurrency prices, manage your portfolio, and compare performance",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthStatus>{children}</AuthStatus>
      </body>
    </html>
  )
}
