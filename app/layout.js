import "./globals.css";

export const metadata = {
  title: "خدمة الطباعة - جامعة طيبة",
  description: "نظام إلكتروني لإدارة طلبات الطباعة في جامعة طيبة",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="mdl-js">
      <head>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content={metadata.viewport} />
        <title>{metadata.title}</title>
      </head>
      <body className="text-gray-200 p-5 min-h-screen">
        <main>{children}</main>
      </body>
    </html>
  );
}
