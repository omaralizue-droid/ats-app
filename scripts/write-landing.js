const fs = require('fs');
const p = 'src/app/landing/page.tsx';

const lines = [];

lines.push("'use client'");
lines.push("");
lines.push("import { useEffect, useRef, useState } from 'react'");
lines.push("import { motion, useInView } from 'framer-motion'");
lines.push("import Link from 'next/link'");
lines.push("import {");
lines.push("  Sparkles, Radar, Zap, UploadCloud, Brain, BarChart3,");
lines.push("  ShieldCheck, ChevronRight, CheckCircle2, ArrowRight,");
lines.push("  Star, FileSearch, Wand2, Play, Globe, Github, Twitter,");
lines.push("} from 'lucide-react'");
lines.push("");

// Marker - just write a skeleton that imports properly and renders
lines.push("export default function LandingPage() {");
lines.push("  return (");
lines.push("    <div className='relative min-h-screen overflow-x-hidden bg-[#090d16] text-[#e6edf7]'>");
lines.push("      <AmbienceLayer />");
lines.push("      <div className='relative z-10'>");
lines.push("        <Navbar />");
lines.push("        <HeroSection />");
lines.push("        <LogoStripSection />");
lines.push("        <FeaturesSection />");
lines.push("        <HowItWorksSection />");
lines.push("        <StatsSection />");
lines.push("        <TestimonialsSection />");
lines.push("        <PricingSection />");
lines.push("        <CtaSection />");
lines.push("        <Footer />");
lines.push("      </div>");
lines.push("    </div>");
lines.push("  )");
lines.push("}");
lines.push("");

fs.writeFileSync(p, lines.join('\n'));
console.log('skeleton written, length:', lines.length);
