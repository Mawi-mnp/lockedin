     1|'use client';
     2|
     3|import Link from 'next/link';
     4|import { useState, useEffect, useRef, useMemo } from 'react';
     5|import SmoothScroll from '@/components/SmoothScroll';
     6|import Header from '@/components/Header';
     7|import Mascot from '@/components/Mascot';
     8|import { FadeIn, FadeInUp, StaggerContainer, StaggerItem, ScaleIn, SlideInLeft, SlideInRight } from '@/components/animations';
     9|import { motion, useScroll, useTransform } from 'framer-motion';
    10|import StaggerGrid from '@/components/animations/StaggerGrid';
    11|import HoverCard from '@/components/animations/HoverCard';
    12|import HoverButton from '@/components/animations/HoverButton';
    13|    11|
    14|    12|export default function LandingPage() {
    15|    13|  const [mounted, setMounted] = useState(false);
    16|    14|  const containerRef = useRef(null);
    17|    15|  const { scrollYProgress } = useScroll();
    18|    16|  
    19|    17|  // Parallax effects for hero orbs
    20|    18|  const heroOrbY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
    21|    19|  const heroOrbScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
    22|    20|  const heroOrbRotate = useTransform(scrollYProgress, [0, 0.2], [0, 10]);
    23|    21|
    24|    22|  useEffect(() => {
    25|    23|    setMounted(true);
    26|    24|  }, []);
    27|    25|
    28|    26|  const howItWorksCards = useMemo(() => [
    29|    27|    {
    30|    28|      number: '1',
    31|    29|      icon: '🎯',
    32|    30|      title: 'Set Your Goal',
    33|    31|      description: 'Define what you\'re committing to — a savings target, a business milestone, or a personal challenge. Set your deadline and stake your claim.',
    34|    32|    },
    35|    33|    {
    36|    34|      number: '2',
    37|    35|      icon: '💰',
    38|    36|      title: 'Stake Commitment',
    39|    37|      description: 'Put skin in the game. Your financial contributions prove you\'re serious. Every deposit builds your reputation and your future.',
    40|    38|    },
    41|    39|    {
    42|    40|      number: '3',
    43|    41|      icon: '📈',
    44|    42|      title: 'Build Your Score',
    45|    43|      description: 'Consistent contributions raise your Commitment Score (0-100). High scorers unlock partnerships and attract serious co-founders.',
    46|    44|    },
    47|    45|  ];
    48|    46|
    49|    47|  const stats = useMemo(() => [
    50|    48|    { value: '100%', label: 'Accountability' },
    51|    49|    { value: '0-100', label: 'Score Range' },
    52|    50|    { value: '24/7', label: 'Progress Tracking' },
    53|    51|    { value: '∞', label: 'Goals Possible' },
    54|    52|  ];
    55|    53|
    56|    54|  const testimonials = useMemo(() => [
    57|    55|    {
    58|    56|      rating: '★★★★★',
    59|    57|      quote: 'My CommitScore of 92 helped me find a co-founder who knew I was serious. We just closed our seed round. This platform is gold.',
    60|    58|      name: 'Alice Chen',
    61|    59|      score: 92,
    62|    60|      role: 'Tech Startup Founder',
    63|    61|      initials: 'AC',
    64|    62|    },
    65|    63|    {
    66|    64|      rating: '★★★★★',
    67|    65|      quote: 'Finally, a way to prove I\'m not just another idea guy. My score went from 45 to 78 in six months. Partners take me seriously now.',
    68|    66|      name: 'Bob Martinez',
    69|    67|      score: 78,
    70|    68|      role: 'E-commerce Venture',
    71|    69|      initials: 'BM',
    72|    70|    },
    73|    71|    {
    74|    72|      rating: '★★★★★',
    75|    73|      quote: 'The accountability is real. Knowing my contributions affect my score keeps me on track. Best decision for my business discipline.',
    76|    74|      name: 'David Kim',
    77|    75|      score: 65,
    78|    76|      role: 'SaaS Builder',
    79|    77|      initials: 'DK',
    80|    78|    },
    81|    79|  ];
    82|    80|
    83|    81|  const scoreTiers = useMemo(() => [
    84|    82|    { icon: '✓', color: '#10b981', title: '90+ Score', desc: 'Champion — Consistent contributor, highly sought after' },
    85|    83|    { icon: '●', color: '#a855f7', title: '70-89 Score', desc: 'Achiever — Solid track record, reliable partner' },
    86|    84|    { icon: '◆', color: '#f59e0b', title: '50-69 Score', desc: 'Builder — Growing reputation, room to prove' },
    87|    85|    { icon: '■', color: '#ef4444', title: 'Below 50', desc: 'Starter — Time to demonstrate commitment' },
    88|    86|  ];
    89|    87|
    90|    88|  return (
    91|    89|    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
    92|    90|      {/* Fixed animated gradient orbs background */}
    93|    91|      <div className="fixed inset-0 pointer-events-none overflow-hidden">
    94|    92|        <motion.div 
    95|    93|          className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px]"
    96|    94|          style={{ transform: heroOrbTransform }}
    97|    95|        >
    98|    96|          <div className="w-full h-full bg-[radial-gradient(circle,rgba(83,58,253,0.2)_0%,rgba(168,85,247,0.1)_40%,transparent_70%)] blur-[60px]" />
    99|    97|        </motion.div>
   100|    98|        <motion.div 
   101|    99|          className="absolute top-[20%] right-0 w-[400px] h-[400px]"
   102|   100|          style={{ x: useTransform(scrollYProgress, [0, 0.3], [0, -50]) }}
   103|   101|        >
   104|   102|          <div className="w-full h-full bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%)] blur-[60px]" />
   105|   103|        </motion.div>
   106|   104|        <motion.div 
   107|   105|          className="absolute bottom-0 left-0 w-[500px] h-[500px]"
   108|   106|          style={{ x: useTransform(scrollYProgress, [0.5, 1], [0, 100]) }}
   109|   107|        >
   110|   108|          <div className="w-full h-full bg-[radial-gradient(circle,rgba(83,58,253,0.1)_0%,transparent_70%)] blur-[60px]" />
   111|   109|        </motion.div>
   112|   110|      </div>
   113|   111|
   114|   112|      {/* Navigation */}
   115|   113|      <motion.nav 
   116|   114|        className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/5"
   117|   115|        initial={{ y: -100 }}
   118|   116|        animate={{ y: 0 }}
   119|   117|        transition={{ duration: 0.5, ease: 'easeOut' }}
   120|   118|      >
   121|   119|        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
   122|   120|          <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight group">
   123|   121|            <motion.div 
   124|   122|              className="w-7 h-7 bg-gradient-to-br from-[#533afd] to-[#a855f7] rounded-md flex items-center justify-center text-base"
   125|   123|              whileHover={{ rotate: 15, scale: 1.1 }}
   126|   124|              transition={{ duration: 0.2 }}
   127|   125|            >
   128|   126|              🦡
   129|   127|            </motion.div>
   130|   128|            <span className="group-hover:text-[#a855f7] transition-colors">CommitScore</span>
   131|   129|          </Link>
   132|   130|          <div className="hidden md:flex items-center gap-8">
   133|   131|            {['How It Works', 'Features', 'Stories'].map((item, i) => (
   134|   132|              <motion.a
   135|   133|                key={item}
   136|   134|                href={`#${item.toLowerCase().replace(' ', '-')}`}
   137|   135|                className="text-sm font-medium text-[#a6a6a6] hover:text-white transition-colors"
   138|   136|                initial={{ opacity: 0, y: -10 }}
   139|   137|                animate={{ opacity: 1, y: 0 }}
   140|   138|                transition={{ delay: 0.1 * i }}
   141|   139|                whileHover={{ y: -2 }}
   142|   140|              >
   143|   141|                {item}
   144|   142|              </motion.a>
   145|   143|            ))}
   146|   144|          </div>
   147|   145|          <div className="flex items-center gap-3">
   148|   146|            <HoverButton href="/login" variant="secondary" className="hidden sm:inline-flex">
   149|   147|              Log In
   150|   148|            </HoverButton>
   151|   149|            <HoverButton href="/register" variant="primary">
   152|   150|              Sign Up
   153|   151|            </HoverButton>
   154|   152|          </div>
   155|   153|        </div>
   156|   154|      </motion.nav>
   157|   155|
   158|   156|      {/* Hero Section with Parallax */}
   159|   157|      <section className="relative pt-[140px] pb-20 px-6 text-center">
   160|   158|        <div className="relative z-10 max-w-[800px] mx-auto">
   161|   159|          <FadeInUp delay={0.1}>
   162|   160|            {/* Mascot - Using new Mascot component */}
   163|   161|                 <Mascot />

   195|   193|          </FadeInUp>
   196|   194|
   197|   195|          <FadeInUp delay={0.2}>
   198|   196|            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
   199|   197|              Build Accountability with<br />
   200|   198|              <span className="bg-gradient-to-r from-[#533afd] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
   201|   199|                Commitment Score
   202|   200|              </span>
   203|   201|            </h1>
   204|   202|          </FadeInUp>
   205|   203|
   206|   204|          <FadeInUp delay={0.3}>
   207|   205|            <p className="text-lg md:text-xl text-[#a6a6a6] max-w-[580px] mx-auto mb-8 leading-relaxed">
   208|   206|              Track your goals, stake your commitment, and build a reputation for following through.
   209|   207|              Connect with entrepreneurs who prove they&apos;re all in.
   210|   208|            </p>
   211|   209|          </FadeInUp>
   212|   210|
   213|   211|          <FadeInUp delay={0.4}>
   214|   212|            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
   215|   213|              <HoverButton href="/register" variant="primary" className="px-8 py-4 text-base">
   216|   214|                Get Started Free
   217|   215|              </HoverButton>
   218|   216|              <HoverButton href="#how-it-works" variant="secondary" className="px-8 py-4 text-base">
   219|   217|                Learn More
   220|   218|              </HoverButton>
   221|   219|            </div>
   222|   220|          </FadeInUp>
   223|   221|
   224|   222|          <FadeInUp delay={0.5}>
   225|   223|            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-[#666]">
   226|   224|              {['No credit card required', '0-100 Score System', 'Find co-founders'].map((item, i) => (
   227|   225|                <motion.div 
   228|   226|                  key={item}
   229|   227|                  className="flex items-center gap-2"
   230|   228|                  whileHover={{ scale: 1.05 }}
   231|   229|                >
   232|   230|                  <span className="text-[#10b981] font-bold">✓</span>
   233|   231|                  <span>{item}</span>
   234|   232|                </motion.div>
   235|   233|              ))}
   236|   234|            </div>
   237|   235|          </FadeInUp>
   238|   236|        </div>
   239|   237|      </section>
   240|   238|
   241|   239|      {/* Stats Bar */}
   242|   240|      <section className="bg-[#0a0a0a] border-y border-white/5 py-10 px-6">
   243|   241|        <div className="max-w-[1200px] mx-auto">
   244|   242|          <StaggerGrid staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-10">
   245|   243|            {stats.map((stat) => (
   246|   244|              <motion.div key={stat.label} className="text-center" whileHover={{ scale: 1.05 }}>
   247|   245|                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent tracking-tight">
   248|   246|                  {stat.value}
   249|   247|                </div>
   250|   248|                <div className="text-sm text-[#666] font-medium mt-2">{stat.label}</div>
   251|   249|              </motion.div>
   252|   250|            ))}
   253|   251|          </StaggerGrid>
   254|   252|        </div>
   255|   253|      </section>
   256|   254|
   257|   255|      {/* How It Works */}
   258|   256|      <section id="how-it-works" className="py-20 px-6">
   259|   257|        <div className="max-w-[1200px] mx-auto">
   260|   258|          <FadeInUp>
   261|   259|            <div className="text-center max-w-[600px] mx-auto mb-20">
   262|   260|              <h2 className="text-4xl md:text-5xl font-bold mb-4">
   263|   261|                How <span className="bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent">It Works</span>
   264|   262|              </h2>
   265|   263|              <p className="text-[#a6a6a6] text-lg">Three simple steps to build your entrepreneur reputation</p>
   266|   264|            </div>
   267|   265|          </FadeInUp>
   268|   266|
   269|   267|          <StaggerGrid staggerDelay={0.15} className="grid md:grid-cols-3 gap-6">
   270|   268|            {howItWorksCards.map((card) => (
   271|   269|              <HoverCard key={card.number} className="group relative bg-[#0f0f0f] border border-white/8 rounded-2xl p-8">
   272|   270|                <div className="absolute top-4 right-4 w-7 h-7 bg-[#0a0a0a] border border-white/8 rounded-full flex items-center justify-center text-xs font-bold text-[#666] font-mono">
   273|   271|                  {card.number}
   274|   272|                </div>
   275|   273|                <div className="w-11 h-11 bg-gradient-to-br from-[#533afd]/20 to-[#a855f7]/10 border border-white/5 rounded-lg flex items-center justify-center text-2xl mb-5">
   276|   274|                  {card.icon}
   277|   275|                </div>
   278|   276|                <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
   279|   277|                <p className="text-[#a6a6a6] leading-relaxed">{card.description}</p>
   280|   278|              </HoverCard>
   281|   279|            ))}
   282|   280|          </StaggerGrid>
   283|   281|        </div>
   284|   282|      </section>
   285|   283|
   286|   284|      {/* Score Visualization */}
   287|   285|      <section className="py-20 px-6 bg-gradient-to-b from-black to-[#0a0a0a] border-y border-white/5">
   288|   286|        <div className="max-w-[1000px] mx-auto grid md:grid-cols-2 gap-12 items-center">
   289|   287|          <FadeInUp>
   290|   288|            <div>
   291|   289|              <h2 className="text-3xl md:text-4xl font-bold mb-5">
   292|   290|                Your Score is Your <span className="bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent">Social Proof</span>
   293|   291|              </h2>
   294|   292|              <p className="text-[#a6a6a6] mb-6 leading-relaxed">
   295|   293|                In the entrepreneur world, trust is everything. Your Commitment Score transforms
   296|   294|                your financial discipline into a verifiable reputation metric.
   297|   295|              </p>
   298|   296|              <ul className="space-y-3 mb-8">
   299|   297|                {scoreTiers.map((tier, i) => (
   300|   298|                  <motion.li 
   301|   299|                    key={tier.title}
   302|   300|                    className="flex items-center gap-3"
   303|   301|                    initial={{ opacity: 0, x: -20 }}
   304|   302|                    whileInView={{ opacity: 1, x: 0 }}
   305|   303|                    transition={{ delay: i * 0.1 }}
   306|   304|                    viewport={{ once: true }}
   307|   305|                    whileHover={{ x: 5 }}
   308|   306|                  >
   309|   307|                    <span 
   310|   308|                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
   311|   309|                      style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
   312|   310|                    >
   313|   311|                      {tier.icon}
   314|   312|                    </span>
   315|   313|                    <span>
   316|   314|                      <strong className="text-white">{tier.title}:</strong> {tier.desc}
   317|   315|                    </span>
   318|   316|                  </motion.li>
   319|   317|                ))}
   320|   318|              </ul>
   321|   319|              <HoverButton href="/register" variant="primary">
   322|   320|                Start Building Your Score
   323|   321|              </HoverButton>
   324|   322|            </div>
   325|   323|          </FadeInUp>
   326|   324|
   327|   325|          <FadeInUp delay={0.2}>
   328|   326|            <HoverCard className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-8 flex flex-col items-center justify-center">
   329|   327|              <motion.div 
   330|   328|                className="relative w-[220px] h-[220px] rounded-full flex items-center justify-center shadow-lg"
   331|   329|                style={{ 
   332|   330|                  background: 'conic-gradient(#533afd 0% 75%, #a855f7 75% 85%, #0a0a0a 85% 100%)',
   333|   331|                  boxShadow: '0 0 40px rgba(83, 58, 253, 0.2)'
   334|   332|                }}
   335|   333|                animate={{ rotate: 360 }}
   336|   334|                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
   337|   335|              >
   338|   336|                <div className="absolute w-[170px] h-[170px] bg-[#0f0f0f] rounded-full border border-white/5" />
   339|   337|                <motion.div 
   340|   338|                  className="relative z-10 text-6xl font-bold font-mono tracking-tighter"
   341|   339|                  animate={{ scale: [1, 1.05, 1] }}
   342|   340|                  transition={{ duration: 2, repeat: Infinity }}
   343|   341|                >
   344|   342|                  75
   345|   343|                </motion.div>
   346|   344|              </motion.div>
   347|   345|              <div className="text-sm text-[#666] font-medium mt-4">Example Score — Achiever Level</div>
   348|   346|            </HoverCard>
   349|   347|          </FadeInUp>
   350|   348|        </div>
   351|   349|      </section>
   352|   350|
   353|   351|      {/* Testimonials */}
   354|   352|      <section id="testimonials" className="py-20 px-6">
   355|   353|        <div className="max-w-[1200px] mx-auto">
   356|   354|          <FadeInUp>
   357|   355|            <div className="text-center max-w-[600px] mx-auto mb-16">
   358|   356|              <h2 className="text-4xl md:text-5xl font-bold mb-4">
   359|   357|                Entrepreneurs <span className="bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent">Trust CommitScore</span>
   360|   358|              </h2>
   361|   359|              <p className="text-[#a6a6a6] text-lg">See how committed founders are building their reputations</p>
   362|   360|            </div>
   363|   361|          </FadeInUp>
   364|   362|
   365|   363|          <StaggerGrid staggerDelay={0.15} className="grid md:grid-cols-3 gap-6">
   366|   364|            {testimonials.map((testimonial) => (
   367|   365|              <HoverCard key={testimonial.name} className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-7">
   368|   366|                <div className="text-[#fbbf24] text-lg mb-4 tracking-widest">{testimonial.rating}</div>
   369|   367|                <p className="text-[#a6a6a6] leading-relaxed mb-5">&quot;{testimonial.quote}&quot;</p>
   370|   368|                <div className="flex items-center gap-3">
   371|   369|                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#533afd] to-[#a855f7] flex items-center justify-center text-sm font-bold">
   372|   370|                    {testimonial.initials}
   373|   371|                  </div>
   374|   372|                  <div>
   375|   373|                    <h4 className="text-sm font-semibold">{testimonial.name}</h4>
   376|   374|                    <p className="text-xs text-[#666]">Score: {testimonial.score} — {testimonial.role}</p>
   377|   375|                  </div>
   378|   376|                </div>
   379|   377|              </HoverCard>
   380|   378|            ))}
   381|   379|          </StaggerGrid>
   382|   380|        </div>
   383|   381|      </section>
   384|   382|
   385|   383|      {/* CTA Section */}
   386|   384|      <section className="py-20 px-6 bg-[#0a0a0a] border-t border-white/8">
   387|   385|        <FadeInUp>
   388|   386|          <div className="max-w-[600px] mx-auto text-center">
   389|   387|            <h2 className="text-4xl md:text-5xl font-bold mb-4">
   390|   388|              Ready to Build <span className="bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent">Better Habits?</span>
   391|   389|            </h2>
   392|   390|            <p className="text-[#666] mb-8">Join thousands of entrepreneurs who prove their commitment every day.</p>
   393|   391|            <form className="flex flex-col sm:flex-row gap-3 max-w-[420px] mx-auto">
   394|   392|              <input
   395|   393|                type="email"
   396|   394|                placeholder="Enter your email"
   397|   395|                className="flex-1 px-5 py-4 bg-[#0f0f0f] border border-white/8 rounded-full text-white placeholder-[#666] focus:outline-none focus:border-[#533afd] focus:ring-2 focus:ring-[#533afd]/20 transition-all"
   398|   396|                required
   399|   397|              />
   400|   398|              <HoverButton variant="primary" className="px-6 py-4 text-sm">
   401|   399|                Create Account
   402|   400|              </HoverButton>
   403|   401|            </form>
   404|   402|          </div>
   405|   403|        </FadeInUp>
   406|   404|      </section>
   407|   405|
   408|   406|      {/* Footer */}
   409|   407|      <footer className="py-12 px-6 border-t border-white/5">
   410|   408|        <div className="max-w-[1200px] mx-auto">
   411|   409|          <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-12">
   412|   410|            <FadeInUp>
   413|   411|              <div className="max-w-[280px]">
   414|   412|                <div className="flex items-center gap-3 text-base font-semibold mb-4">
   415|   413|                  <span>🦡</span>
   416|   414|                  <span>CommitScore</span>
   417|   415|                </div>
   418|   416|                <p className="text-sm text-[#666] leading-relaxed">
   419|   417|                  Build accountability, achieve goals, and connect with entrepreneurs who are all in.
   420|   418|                </p>
   421|   419|              </div>
   422|   420|            </FadeInUp>
   423|   421|            
   424|   422|            {['PRODUCT', 'COMPANY', 'LEGAL'].map((category, i) => (
   425|   423|              <FadeInUp key={category} delay={0.1 * i}>
   426|   424|                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 font-mono">{category}</h4>
   427|   425|                <ul className="space-y-3">
   428|   426|                  {['Features', 'Pricing', 'API', 'Integrations'].slice(0, 4 - i).map((item) => (
   429|   427|                    <li key={item}>
   430|   428|                      <motion.a 
   431|   429|                        href="#" 
   432|   430|                        className="text-sm text-[#666] hover:text-white transition-colors"
   433|   431|                        whileHover={{ x: 5 }}
   434|   432|                      >
   435|   433|                        {item}
   436|   434|                      </motion.a>
   437|   435|                    </li>
   438|   436|                  ))}
   439|   437|                </ul>
   440|   438|              </FadeInUp>
   441|   439|            ))}
   442|   440|          </div>
   443|   441|          <FadeInUp>
   444|   442|            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5">
   445|   443|              <p className="text-xs text-[#666]">© 2026 CommitScore. All rights reserved.</p>
   446|   444|              <div className="flex gap-4 mt-4 md:mt-0">
   447|   445|                {['𝕏', 'in', '◉'].map((icon, i) => (
   448|   446|                  <motion.a
   449|   447|                    key={icon}
   450|   448|                    href="#"
   451|   449|                    className="text-[#666] hover:text-[#533afd] transition-colors text-lg no-underline"
   452|   450|                    whileHover={{ scale: 1.2, y: -2 }}
   453|   451|                    whileTap={{ scale: 0.9 }}
   454|   452|                  >
   455|   453|                    {icon}
   456|   454|                  </motion.a>
   457|   455|                ))}
   458|   456|              </div>
   459|   457|            </div>
   460|   458|          </FadeInUp>
   461|   459|        </div>
   462|   460|      </footer>
   463|   461|
   464|   462|      {/* Custom CSS for animations */}
   465|   463|      {mounted && (
   466|   464|        <style jsx global>{`
   467|   465|          @keyframes float {
   468|   466|            0%, 100% { transform: translateY(0) rotate(0deg); }
   469|   467|            50% { transform: translateY(-12px) rotate(2deg); }
   470|   468|          }
   471|   469|        `}</style>
   472|   470|      )}
   473|   471|    </div>
   474|   472|  );
   475|   473|}
   476|   474|