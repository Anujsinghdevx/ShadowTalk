import AuthProvider from "@/context/AuthProvider";
import './globals.css'

// import { Toaster } from "@/components/ui/toaster"
// import Navbar from "@/components/Navbar";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
      <body>
        {/* <Navbar /> */}
        {children}
        {/* <Toaster /> */}
      </body>
      </AuthProvider>
    </html>
  );
}
