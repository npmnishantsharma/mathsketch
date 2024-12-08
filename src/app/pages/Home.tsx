"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Brain, Users, Zap, ArrowRight, Github, Pencil, Bot, Award, Eye, Calculator, Wand2, Keyboard, Share2, History, Shapes } from "lucide-react";
import Image from "next/image";
import PreviewModal from "@/components/PreviewModal";
import type { Theme } from "@/app/types/interfaces";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

// Add proper typing to the theme object
const previewTheme: Theme = {
  id: "preview-theme",
  name: "MathSketch Preview",
  background: "#0f172a",
  text: "#ffffff",
  primary: "#3b82f6",
  secondary: "#64748b",
  gradientFrom: "from-blue-600",
  gradientVia: "via-indigo-600",
  gradientTo: "to-purple-600",
};

const equations = [
  "∫∫∫ f(x,y,z) dV",
  "∇ × F = curl F",
  "∮ E·dl = -dΦ/dt",
  "∇²ψ + k²ψ = 0",
  "det(A-λI) = 0",
  "P(A∩B) = P(A)P(B)",
  "∑(n=1 to ∞) 1/n²",
  "d/dx[f(g(x))]",
  "∫(e^x)dx = e^x + C",
  "lim(h→0) Δy/Δx"
];

const MathParticle = ({ delay = 0 }) => {
  const symbols = ["∫", "∑", "π", "±", "∞", "√", "∂", "∇", "∆", "θ"];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  
  return (
    <motion.div
      className="fixed text-blue-500/20 text-xl font-mono"
      initial={{
        x: `${Math.random() * 100}vw`,
        y: "110vh",
        scale: 0.5 + Math.random() * 0.5,
      }}
      animate={{
        y: "-10vh",
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 10 + Math.random() * 5,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {symbol}
    </motion.div>
  );
};

const TypingEquation = () => {
  const equations = [
    { text: "lim(x→∞) 1/x = 0", steps: ["lim(x→∞)", "lim(x→∞) 1/x", "lim(x→∞) 1/x = 0"] },
    { text: "∫(x²) dx = x³/3 + C", steps: ["∫(x²)", "∫(x²) dx", "∫(x²) dx = x³/3", "∫(x²) dx = x³/3 + C"] },
    { text: "d/dx(sin x) = cos x", steps: ["d/dx(sin x)", "d/dx(sin x) =", "d/dx(sin x) = cos x"] }
  ];

  const randomEq = equations[Math.floor(Math.random() * equations.length)];

  return (
    <motion.div
      className="fixed text-blue-500/15 text-4xl md:text-5xl font-mono"
      initial={{
        x: `${Math.random() * 80 + 10}vw`,
        y: `${Math.random() * 80 + 10}vh`,
        opacity: 0
      }}
      animate={{
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatDelay: 4
      }}
    >
      <motion.div className="flex flex-col gap-2">
        {randomEq.steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: index * 1,
              duration: 0.5
            }}
          >
            {step}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

const SolvingAnimation = () => {
  const allSteps = [
    {
      steps: [
        "∫(x²+2x+1)dx",
        "= ∫x²dx + ∫2xdx + ∫dx",
        "= x³/3 + x² + x + C"
      ]
    },
    {
      steps: [
        "lim(x→0) (sin x)/x",
        "= lim(x→0) (cos x)",
        "= 1"
      ]
    },
    {
      steps: [
        "d/dx[ln(x²+1)]",
        "= (2x)/(x²+1)",
        "= 2x/(x²+1)"
      ]
    }
  ];

  const randomProblem = allSteps[Math.floor(Math.random() * allSteps.length)];

  return (
    <motion.div
      className="fixed text-blue-400/15 text-3xl md:text-4xl font-mono"
      initial={{
        x: `${Math.random() * 80 + 10}vw`,
        y: `${Math.random() * 80 + 10}vh`,
        opacity: 0,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        repeatDelay: 6,
      }}
    >
      <motion.div className="flex flex-col gap-3">
        {randomProblem.steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * 1.5,
              duration: 0.8,
            }}
          >
            {step}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default function IntroPage() {
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { scrollYProgress } = useScroll();

  // Move these hooks before any conditional returns
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const previewsY = useTransform(scrollYProgress, [0.1, 0.3], [100, 0]);
  const previewsOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  // Add authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/app");
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const generateRandomPosition = () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    scale: 0.5 + Math.random() * 0.5,
    rotate: Math.random() * 30 - 15,
  });

  const particles = Array.from({ length: 20 }, (_, i) => (
    <MathParticle key={i} delay={i * 0.5} />
  ));

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin border-white"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, return null (will redirect in useEffect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 overflow-x-hidden">
      {/* Background Equations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {equations.map((eq, index) => (
          <motion.div
            key={index}
            className="absolute text-blue-500/15 text-3xl md:text-5xl font-mono whitespace-nowrap"
            initial={generateRandomPosition()}
            animate={{
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              scale: [0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5],
              rotate: [Math.random() * 30 - 15, Math.random() * 30 - 15],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
            style={{
              filter: "blur(2px)",
            }}
          >
            {eq}
          </motion.div>
        ))}
      </div>

      {/* Add a subtle gradient overlay to improve text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-950/50 to-transparent pointer-events-none" />

      {/* Hero Section - Now with scroll animations */}
      <motion.div 
        className="container mx-auto px-4 py-16 relative"
        style={{ scale: heroScale, opacity: heroOpacity }}
      >
        {/* Existing hero content */}
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-75 blur"></div>
            <h1 className="relative text-4xl md:text-6xl font-bold text-white bg-blue-950/50 rounded-lg px-6 py-2">
              MathSketch
            </h1>
          </motion.div>
          <motion.p 
            className="text-xl md:text-2xl text-blue-100 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Draw, Solve, and Learn Mathematics with AI-Powered Assistance
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button 
              onClick={() => router.push("/app")}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-blue-500/20 hover:bg-blue-900/20 text-white px-8 py-6 text-lg flex items-center gap-2"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="w-5 h-5" /> Live Preview
            </Button>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <motion.div 
          className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [-100, 0, -100],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            y: [-50, 50, -50],
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Preview Cards - Now with scroll animations */}
      <motion.div 
        className="container mx-auto px-4 py-8"
        style={{ 
          y: previewsY,
          opacity: previewsOpacity,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="relative rounded-xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-transparent z-10"></div>
            <Image
              src="/preview-draw.png"
              alt="Drawing Preview"
              width={600}
              height={400}
              className="w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://res.cloudinary.com/dhvcqp8zp/image/upload/f_auto,q_auto/v1/mathsketch_assets/png36d4dtuipgh61eaqb";
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <h3 className="text-2xl font-bold text-white mb-2">Intuitive Drawing</h3>
              <p className="text-blue-100">Write and sketch your mathematical problems naturally</p>
            </div>
          </motion.div>

          <motion.div
            className="relative rounded-xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-transparent z-10"></div>
            <Image
              src="/preview-solve.png"
              alt="AI Solution Preview"
              width={600}
              height={400}
              className="w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://res.cloudinary.com/dhvcqp8zp/image/upload/f_auto,q_auto/v1/mathsketch_assets/xanrzzueui4xb1zd0zj0";
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <h3 className="text-2xl font-bold text-white mb-2">AI-Powered Solutions</h3>
              <p className="text-blue-100">Get instant explanations and step-by-step guidance</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section - Add hover animations */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="bg-blue-900/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
              <Pencil className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Natural Input</h3>
            <p className="text-blue-100">Draw equations and diagrams just like you would on paper</p>
          </motion.div>

          <motion.div 
            className="bg-blue-900/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Recognition</h3>
            <p className="text-blue-100">Advanced AI understands your handwriting and mathematical notation</p>
          </motion.div>

          <motion.div 
            className="bg-blue-900/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Learn & Earn</h3>
            <p className="text-blue-100">Earn points and track your progress as you solve problems</p>
          </motion.div>
        </div>
      </div>

      {/* Advanced Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Advanced Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div 
            className="bg-blue-900/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Auto-Solve</h3>
            <p className="text-blue-100">Get instant solutions as you write with real-time AI assistance</p>
          </motion.div>

          <motion.div 
            className="bg-blue-900/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Math Keyboard</h3>
            <p className="text-blue-100">Special keyboard for mathematical symbols and equations</p>
          </motion.div>

          <motion.div 
            className="bg-blue-900/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-4">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Real-time Collaboration</h3>
            <p className="text-blue-100">Work together with others in real-time collaborative sessions</p>
          </motion.div>

          <motion.div 
            className="bg-blue-900/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4">
              <History className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Solution History</h3>
            <p className="text-blue-100">Access your past solutions and track your learning progress</p>
          </motion.div>

          <motion.div 
            className="bg-blue-900/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
              <Shapes className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Shape Tools</h3>
            <p className="text-blue-100">Draw perfect geometric shapes with smart shape recognition</p>
          </motion.div>

          <motion.div 
            className="bg-blue-900/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mb-4">
              <Keyboard className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">LaTeX Export</h3>
            <p className="text-blue-100">Convert your handwritten equations to LaTeX format</p>
          </motion.div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-lg rounded-xl p-8 border border-blue-500/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Experience Auto-Solve</h2>
              <p className="text-blue-100 mb-6">
                Write your mathematical problems naturally, and watch as our AI instantly recognizes and solves them in real-time.
              </p>
              <ul className="space-y-4">
                {[
                  "Instant handwriting recognition",
                  "Step-by-step explanations",
                  "Multiple solution methods",
                  "Practice suggestions",
                  "Interactive learning"
                ].map((feature, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center gap-2 text-blue-100"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-75 blur"></div>
              <div className="relative bg-blue-950 rounded-lg p-4">
                <Image
                  src="/autosolve-preview.png"
                  alt="Auto-solve Preview"
                  width={500}
                  height={300}
                  className="rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://res.cloudinary.com/dhvcqp8zp/image/upload/f_auto,q_auto/v1/mathsketch_assets/autosolve";
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Call to Action - Add floating animation */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-lg rounded-xl p-8 text-center border border-blue-500/20"
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of students who are already using MathSketch to improve their mathematical skills.</p>
          <Button 
            onClick={() => router.push("/app")}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg flex items-center gap-2 mx-auto shadow-lg shadow-blue-500/20"
          >
            <Sparkles className="w-5 h-5" /> Try MathSketch Now
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8">
        <div className="text-center text-blue-200/60 text-sm">
          <p>© 2024 MathSketch. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ for mathematics education</p>
        </div>
      </footer>

      {/* Preview Modal */}
      <PreviewModal
        theme={previewTheme}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {particles}
        <SolvingAnimation />
        <SolvingAnimation />
        <TypingEquation />
        <TypingEquation />
      </div>
    </div>
  );
} 