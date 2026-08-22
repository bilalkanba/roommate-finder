import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session)
    })
  }, [])

  return (
    <div className="bg-noise min-h-screen">
      {/* ===== Hero ===== */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="flex flex-col items-center text-center animate-fade-in">
          {/* Badge */}
          <div className="badge badge-accent mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            AI-powered matching
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter text-neutral-900 mb-6 max-w-3xl">
            Trouve le colocataire
            <br />
            <span className="text-emerald-600">qui te ressemble.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mb-10 leading-relaxed">
            Fini les mauvaises surprises. Notre algorithme analyse 7 dimensions de compatibilité
            pour te matcher avec la bonne personne, partout en Europe.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={isAuthed ? '/matches' : '/login'} className="btn-primary text-base px-6 py-3">
              Commencer maintenant
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a href="#how" className="btn-secondary text-base px-6 py-3">
              Comment ça marche
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-6 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['from-emerald-400 to-emerald-600', 'from-blue-400 to-blue-600', 'from-purple-400 to-purple-600'].map((grad, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${grad} border-2 border-white`}></div>
                ))}
              </div>
              <span>Rejoins la communauté</span>
            </div>
            <div className="w-px h-4 bg-neutral-300"></div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
              <span className="ml-1">Matching intelligent</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="section-title">Comment ça marche</div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
            Trois étapes. Zéro surprise.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              n: '01',
              title: 'Crée ton profil',
              desc: 'Réponds à des questions simples sur ton style de vie : horaires, propreté, sociabilité, budget.',
              icon: '👤',
            },
            {
              n: '02',
              title: 'Notre IA analyse',
              desc: '7 dimensions de compatibilité comparées sur des milliers de combinaisons pour trouver tes meilleurs matches.',
              icon: '✨',
            },
            {
              n: '03',
              title: 'Rencontre ton match',
              desc: 'Contacte les profils compatibles avec des explications claires sur pourquoi vous vous entendrez.',
              icon: '🤝',
            },
          ].map((step) => (
            <div key={step.n} className="card card-hover">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-emerald-600">{step.n}</span>
                <div className="h-px flex-1 bg-neutral-200"></div>
              </div>
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== The 7 dimensions ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="card p-8 md:p-12 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white border-neutral-900">
          <div className="section-title text-emerald-400">L'algorithme</div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
            7 dimensions qui changent tout
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Budget', pct: '25%' },
              { label: 'Horaires', pct: '20%' },
              { label: 'Propreté', pct: '15%' },
              { label: 'Sociabilité', pct: '15%' },
              { label: 'Fumeur', pct: '10%' },
              { label: 'Bruit', pct: '10%' },
              { label: 'Âge', pct: '5%' },
            ].map((d) => (
              <div key={d.label} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-xs text-emerald-400 font-semibold mb-1">{d.pct}</div>
                <div className="text-sm text-neutral-200">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
          Prêt à trouver ton coloc idéal ?
        </h2>
        <p className="text-neutral-600 mb-8">
          Deux minutes pour créer ton profil. Les matches arrivent ensuite.
        </p>
        <Link to={isAuthed ? '/matches' : '/login'} className="btn-primary text-base px-6 py-3">
          Créer mon profil
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-neutral-200 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <div>© 2026 Roommate Finder AI</div>
          <div className="flex items-center gap-2">
            Built with <span className="text-red-500">♥</span> by Bilal Kanba
          </div>
        </div>
      </footer>
    </div>
  )
}