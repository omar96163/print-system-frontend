import "./globals.css";

export const metadata = {
  title: "خدمة الطباعة - جامعة طيبة",
  description: "نظام إلكتروني لإدارة طلبات الطباعة في جامعة طيبة",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="mdl-js">
      <head>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content={metadata.viewport} />
        <title>{metadata.title}</title>
      </head>
      <body className="text-gray-200 bg-gray-50 min-h-screen">
        <main>{children}</main>
      </body>
    </html>
  );
}
