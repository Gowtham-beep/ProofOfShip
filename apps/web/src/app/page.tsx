import React from 'react'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="text-on-surface antialiased bg-[#10141a] min-h-screen">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[#181c22] font-['Inter'] antialiased tracking-tight">
        <nav className="flex justify-between items-center px-6 py-3 w-full max-w-full">
          <div className="text-xl font-bold tracking-tighter text-[#dfe2eb]">ProofOfShip</div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-[#67df70] border-b-2 border-[#67df70] pb-1 hover:text-[#dfe2eb] transition-colors duration-200" href="#">Explore</a>
            <a className="text-[#bdcab8] hover:text-[#dfe2eb] transition-colors duration-200" href="#">Leaderboard</a>
            <a className="text-[#bdcab8] hover:text-[#dfe2eb] transition-colors duration-200" href="#">Docs</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-[#bdcab8] hover:text-[#dfe2eb] transition-colors">Sign In</button>
            <a href="http://localhost:3001/auth/github" className="bg-[#67df70] text-[#00390d] px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform flex items-center justify-center">Connect GitHub</a>
          </div>
        </nav>
      </header>
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3fb95015_0%,transparent_50%)]"></div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-6 max-w-4xl">
            Prove You Ship <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-container">Clean Code</span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Connect GitHub. Get a verified ProofOfShip Score. Share it everywhere.
          </p>
          <div className="flex flex-col items-center gap-4 relative z-10">
            <a href="http://localhost:3001/auth/github" className="flex items-center gap-3 bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-lg font-bold text-lg hover:shadow-[0_0_30px_-5px_rgba(103,223,112,0.4)] transition-all active:scale-95">
              <span className="material-symbols-outlined" data-icon="terminal">terminal</span>
              Connect GitHub
            </a>
            <span className="text-xs font-medium text-outline uppercase tracking-widest">Free for public repos</span>
          </div>
        </section>
        {/* How It Works */}
        <section className="bg-surface-container-low py-24 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-lg text-primary font-bold border border-outline-variant/20">1</div>
                <h3 className="text-xl font-bold text-on-surface">Connect GitHub</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Authorize read access to your public repos. We never write to your code.</p>
              </div>
              <div className="flex flex-col items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-lg text-primary font-bold border border-outline-variant/20">2</div>
                <h3 className="text-xl font-bold text-on-surface">Get your ProofOfShip Score</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Our engine calculates complexity, clean code adherence, and consistency metrics.</p>
              </div>
              <div className="flex flex-col items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-lg text-primary font-bold border border-outline-variant/20">3</div>
                <h3 className="text-xl font-bold text-on-surface">Share your card everywhere</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Embed your reputation card in your README, portfolio, or Twitter profile.</p>
              </div>
            </div>
          </div>
        </section>
        {/* Sample Card Section */}
        <section className="py-24 px-6 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-on-surface mb-12">The Immutable Reputation</h2>
          <div className="w-full max-w-[495px] h-[195px] relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary-container/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative w-full h-full flex justify-center items-center">
              <img
                src="http://localhost:3002/card/Gowtham-beep"
                alt="ProofOfShip Score Card"
                width={495}
                height={195}
                style={{ borderRadius: '10px' }}
              />
            </div>
          </div>
        </section>
        {/* Leaderboard Teaser */}
        <section className="bg-surface-container-low py-24 px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">Join 1,200+ developers proving their code quality</h2>
            <p className="text-on-surface-variant mb-12">Elite engineers from across the globe shipping verifiable results.</p>
            <div className="bg-surface-container rounded-xl overflow-hidden shadow-2xl">
              <div className="divide-y divide-outline-variant/10">
                {/* Entry 1 */}
                <div className="flex items-center justify-between p-6 hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-outline font-mono text-sm w-4">01</span>
                    <img alt="Dev Avatar" className="w-10 h-10 rounded-lg object-cover" data-alt="Close-up portrait of a developer in a modern workspace with neon backlighting, high-end professional aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKxyf6Ra57LBlxjj1E4WsCKmQKJLK5LCsUTSFPDZsAmL9PQfy_PPQDh7Zy2kse8DjfhsYWfAMAkU7PRROb-ccDtaIySk9TSbC8EiEajSVkm7jfQ_ujy6Ungd3fWmI1_ShuHHLn7LYRmNZoI5KXHQkTAGg1Mf7xlDPWhuHM67_JfgmtRvBxwodDK42hljV_akooYNGHT-C8OW9MLa6qVkAGRbHLnZIxF6jqLoEsj1IEpYH18lnFU0Qxqee3DrwawHWYXA3b4_-8ig" />
                    <span className="font-bold text-on-surface">alex_shipped</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[98%]"></div>
                    </div>
                    <span className="font-mono font-bold text-primary">98</span>
                  </div>
                </div>
                {/* Entry 2 */}
                <div className="flex items-center justify-between p-6 hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-outline font-mono text-sm w-4">02</span>
                    <img alt="Dev Avatar" className="w-10 h-10 rounded-lg object-cover" data-alt="Professional profile photo of a software engineer, clean studio lighting, focused expression, tech-oriented mood" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkI0VUfNljTd8w897IcgDVnMJ2TEGlzX8qcYEOifZZD0dl5NawTMvrEgWF_8BWfy5cqkwxnuFPF5eIU8jDSuwjhxBmno_px74wrcTUd4Fm-dJt6jAj3Dtc4Z-3GXXmM2OcwbphWhds5TSBtOPqWDZqQbvdzVIAhl4QmqzVoNlYqnKcwcCC2S23hfdnfrPVT_AD0RpnxPgnHzc1Lu_RZv79Kln_DkWMaSmxHpPnzzNpHMLLU8Ohf8bNR5DZOT3A4nHy0RCl7c8WiQ" />
                    <span className="font-bold text-on-surface">dev_jenna</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[95%]"></div>
                    </div>
                    <span className="font-mono font-bold text-primary">95</span>
                  </div>
                </div>
                {/* Entry 3 */}
                <div className="flex items-center justify-between p-6 hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-outline font-mono text-sm w-4">03</span>
                    <img alt="Dev Avatar" className="w-10 h-10 rounded-lg object-cover" data-alt="Minimalist headshot of a technical lead, blurred urban background, sophisticated lighting, high contrast" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSvaLSzuAFg1J-X8xuBxgNVJ20OATSrgu5CwrceSiahCphQ50zs1Rk-rMpJXaA4ozFcLoPJqN0i_1VNf3xR88FKnF4cOHEZeWBtLcw4F9xURVN6e54Sw03ZP9E5YO--bfjBerMyMIaVcRmmLJpf11gis2nT65yT4fptGc6j_ZvHcNTbr1fJt0ZoD6JYdjnxdb6LGrJh-6tGIE7M-26me7lDstM5nTTVpzB-IEtMw9kPGBBV13ExcDdkcoqE26xBnUfv1dQjeKn4w" />
                    <span className="font-bold text-on-surface">marcus_codes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[92%]"></div>
                    </div>
                    <span className="font-mono font-bold text-primary">92</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-[#10141a] w-full border-t border-[#3e4a3c]/15 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto">
          <div className="mb-6 md:mb-0">
            <div className="text-lg font-bold text-[#dfe2eb] mb-2">ProofOfShip</div>
            <p className="text-sm font-['Inter'] text-[#bdcab8]">© 2026 ProofOfShip. Immutable technical achievement.</p>
            <div className="mt-4 text-[#67df70] font-mono text-xs font-bold">proofofship.dev</div>
          </div>
          <div className="flex gap-8">
            <a className="text-sm font-['Inter'] text-[#bdcab8] hover:text-[#67df70] transition-opacity hover:opacity-80" href="#">Terms</a>
            <a className="text-sm font-['Inter'] text-[#bdcab8] hover:text-[#67df70] transition-opacity hover:opacity-80" href="#">Privacy</a>
            <a className="text-sm font-['Inter'] text-[#bdcab8] hover:text-[#67df70] transition-opacity hover:opacity-80" href="#">GitHub</a>
            <a className="text-sm font-['Inter'] text-[#bdcab8] hover:text-[#67df70] transition-opacity hover:opacity-80" href="#">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
