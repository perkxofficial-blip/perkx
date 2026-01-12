import { cookies } from 'next/headers';

// Server-side data fetching (SSR)
async function getLandingData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    const res = await fetch('http://localhost:3000/api/landing/features', {
      cache: 'no-store',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    if (!res.ok) return { features: [] };
    return res.json();
  } catch {
    return { features: [] };
  }
}

export default async function LandingPage() {
  const data = await getLandingData();
  
  return (
    <div className="min-h-screen">
      {/* Responsive Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Perkx</h1>
            
            <div className="hidden md:flex items-center gap-4">
              <a href="/user" className="px-4 py-2 text-gray-700 hover:text-gray-900">
                Dashboard
              </a>
              <a href="/admin" className="px-4 py-2 text-gray-700 hover:text-gray-900">
                Admin
              </a>
            </div>
            
            <button className="md:hidden">☰</button>
          </div>
        </div>
      </nav>

      {/* Hero Section - SSR + Responsive */}
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            Welcome to Perkx
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            SSR Landing Page with Authentication
          </p>
        </div>
      </section>

      {/* Features Section - Responsive Grid */}
      <section className="container mx-auto px-4 py-12 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data?.features?.map((feature: any) => (
            <div key={feature.id} className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 Perkx. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
