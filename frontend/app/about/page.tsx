// app/about/page.tsx
'use client';

import Image from 'next/image';
import { 
  User, 
  Briefcase, 
  Target, 
  Eye, 
  Sparkles, 
  Shield, 
  FileText, 
  DollarSign, 
  MessageSquare, 
  Languages,
  Zap,
  Code,
  Cloud,
  Database,
  Mail,
  ArrowRight,
  CheckCircle,
  Award,
  BookOpen,
  Users,
  Rocket,
  Cpu,
  Server,
  Globe,
  Layout,
  Terminal,
  Brain,
  BarChart
} from 'lucide-react';

export default function AboutPage() {
  const technologies = [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Tailwind CSS",
    "FastAPI",
    "Python",
    "Azure AI Foundry",
    "Azure OpenAI GPT-4.1 Mini",
    "Semantic Kernel",
    "JWT Authentication",
    "REST APIs",
    "Render",
    "Netlify",
  ];

  const features = [
    {
      icon: FileText,
      title: "AI Document Summarization",
      description: "Generate concise and accurate summaries of lengthy legal contracts using Azure OpenAI.",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Risk Analysis",
      description: "Identify potential legal risks, liabilities, penalties, obligations, and critical clauses.",
      color: "orange",
    },
    {
      icon: DollarSign,
      title: "Financial Extraction",
      description: "Automatically detect monetary values, payment terms, penalties, and financial obligations.",
      color: "emerald",
    },
    {
      icon: MessageSquare,
      title: "AI Legal Chat",
      description: "Ask questions about uploaded documents and receive contextual AI-powered answers.",
      color: "purple",
    },
    {
      icon: Languages,
      title: "Translation",
      description: "Translate legal documents into multiple languages while preserving legal terminology.",
      color: "cyan",
    },
  ];

  const skills = [
    { category: 'Artificial Intelligence', skills: ['Langchain', 'OpenAI', 'Semantic Kernel'], icon: Brain },
    { category: 'Cloud Platforms', skills: ['Microsoft Azure', 'IaaS / PaaS / SaaS'], icon: Cloud },
    { category: 'Databases', skills: ['MongoDB', 'SQL'], icon: Database },
    { category: 'Data Analysis', skills: ['NumPy / Pandas', 'Matplotlib'], icon: BarChart },
    { category: 'Frontend', skills: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS'], icon: Layout },
    { category: 'Backend', skills: ['Node.js / Express.js', 'FastAPI', 'Python'], icon: Server },
    { category: 'Programming', skills: ['Python', 'C++', 'JavaScript', 'TypeScript'], icon: Code },
  ];

  const strengths = [
    { icon: '⚡', text: 'Fast Learner' },
    { icon: '🔍', text: 'Problem Solver' },
    { icon: '🤝', text: 'Team Player' },
    { icon: '🚀', text: 'Innovative' },
    { icon: '🎯', text: 'Goal-Oriented' },
    { icon: '💡', text: 'Creative Thinker' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section - About Me */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Profile Image - Replace URL with your image */}
            <div className="lg:w-1/3 flex-shrink-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl blur-lg opacity-30" />
                <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-2xl overflow-hidden border-4 border-white shadow-2xl mx-auto">
                  <img
                    src="https://res.cloudinary.com/dadapse5k/image/upload/v1759377580/akshay4_k1qqtn.png"
                    alt="Akshay Kireet"
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-sky-600 text-white px-4 py-2 rounded-xl shadow-lg">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Researcher
                  </span>
                </div>
              </div>
            </div>

            {/* Developer Info */}
            <div className="lg:w-2/3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-800 border border-sky-200 mb-4">
                <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                <span className="text-sm font-semibold">AI Researcher & Full-Stack Developer</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                Dainampally Akshay Kireet
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                A highly motivated professional with a solid foundation in Data Structures and Algorithms (DSA) and 
                Machine Learning (ML) algorithms, capable of analyzing complex problems and developing efficient solutions.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm">
                  📚 B.Tech Graduate
                </div>
                <div className="px-4 py-2 rounded-xl bg-sky-100 border border-sky-200 text-sky-800 text-sm font-medium">
                  💼 Microsoft Intern
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm">
                  🚀 Quick Learner
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                <a
                  href="https://www.linkedin.com/in/dainampallyakshay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-sky-100 border border-slate-200 hover:border-sky-300 transition-all"
                >
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-sky-100 border border-slate-200 hover:border-sky-300 transition-all"
                >
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-sky-100 border border-slate-200 hover:border-sky-300 transition-all"
                >
                </a>
                <a
                  href="mailto:akshay@example.com"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-sky-100 border border-slate-200 hover:border-sky-300 transition-all"
                >
                  <Mail className="w-5 h-5 text-slate-600 hover:text-sky-600" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Experience */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mission Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 text-2xl">
                🎯
              </div>
              <h3 className="text-xl font-bold text-slate-800">Mission</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              To bridge the gap between cutting-edge AI research and practical software solutions, 
              creating intelligent systems that solve real-world problems while fostering collaboration 
              and innovation in dynamic technological environments.
            </p>
          </div>

          {/* Vision Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 text-2xl">
                🔭
              </div>
              <h3 className="text-xl font-bold text-slate-800">Vision</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              To become a leading innovator in AI-driven full-stack development, pushing the boundaries 
              of what's possible while maintaining a strong focus on ethical AI practices and sustainable 
              technological growth.
            </p>
          </div>

          {/* Microsoft Experience Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 text-2xl">
                🏢
              </div>
              <h3 className="text-xl font-bold text-slate-800">Microsoft Experience</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Microsoft intern with a passion for technology and an insatiable curiosity for emerging innovations. 
              Bringing hands-on experience from my internship while bridging academic knowledge with real-world 
              applications in AI and software development.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Skills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Technical Skills
            </h2>
            <div className="w-16 h-1 bg-sky-500 rounded-full mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {skills.map(({ category, skills, icon: Icon }) => (
              <div key={category} className="group">
                <h4 className="text-slate-800 font-semibold mb-3 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-sky-500" />
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-sm hover:bg-sky-100 hover:border-sky-300 transition-all"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Key Strengths */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h4 className="text-slate-800 font-semibold mb-4 text-center">Key Strengths</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {strengths.map((strength) => (
                <div 
                  key={strength.text} 
                  className="p-3 bg-slate-100 rounded-xl border border-slate-200 hover:bg-sky-100 hover:border-sky-300 hover:-translate-y-1 transition-all duration-300 text-center"
                >
                  <div className="text-xl mb-1">{strength.icon}</div>
                  <div className="text-slate-600 text-xs font-medium">{strength.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LexAI - The Platform */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.png"
                  alt="LexAI Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">LexAI</h2>
            </div>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              AI-Powered Legal Document Analysis Platform designed to simplify legal document understanding 
              using Generative AI.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* About LexAI */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-500" />
                  What is LexAI?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  LexAI is an AI-powered Legal Document Analysis Platform designed to simplify legal document 
                  understanding using Generative AI. It enables lawyers, businesses, students, and professionals 
                  to quickly analyze contracts, identify legal risks, summarize complex clauses, extract financial 
                  information, and interact with documents through an intelligent AI assistant.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-sky-500" />
                  Why LexAI?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Legal documents are often lengthy, difficult to understand, and require significant manual effort. 
                  LexAI leverages Artificial Intelligence to reduce the time spent reviewing contracts while improving 
                  accessibility, productivity, and decision-making.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-sky-500" />
                  Built With
                </h3>
                <div className="flex flex-wrap gap-2">
                  {technologies.slice(0, 8).map((tech) => (
                    <span 
                      key={tech} 
                      className="px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-700 text-sm font-medium hover:bg-sky-100 transition-all"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-500" />
                Core Features
              </h3>
              <div className="grid gap-4">
                {features.map((feature, index) => {
                  const colorMap = {
                    blue: 'bg-blue-50 text-blue-600 border-blue-200',
                    orange: 'bg-orange-50 text-orange-600 border-orange-200',
                    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                    purple: 'bg-purple-50 text-purple-600 border-purple-200',
                    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
                  };
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                        colorMap[feature.color as keyof typeof colorMap]
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/70 ${
                          colorMap[feature.color as keyof typeof colorMap]
                        }`}>
                          <feature.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {feature.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Workflow */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 text-center flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-sky-500" />
              AI Analysis Workflow
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { icon: '📄', label: 'Upload Document' },
                { icon: '⚡', label: 'Process File' },
                { icon: '🧠', label: 'AI Analysis' },
                { icon: '🔍', label: 'Extract Insights' },
                { icon: '📊', label: 'Generate Results' },
              ].map((step, index) => (
                <div key={index} className="text-center p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-2xl mb-1">{step.icon}</div>
                  <p className="text-xs font-medium text-slate-700">{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
            Technologies Used
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-8 shadow-sm text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Let's Build Something Amazing Together
          </h3>
          <p className="text-slate-600 mb-5">
            Ready to collaborate on innovative projects and push technological boundaries.
          </p>
          <button 
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/20 hover:bg-sky-700 hover:shadow-sky-500/30 hover:-translate-y-0.5 transition-all duration-300" 
            onClick={() => window.open('https://www.linkedin.com/in/dainampallyakshay/', '_blank')}
          >
            Get In Touch
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}