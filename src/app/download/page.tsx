"use client"
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Sparkles, Laptop2, Zap, Brain, Palette, Clock, Shield, Award, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DownloadPage = () => {
  const platforms = [
    {
      id: 'windows',
      name: 'Windows',
      version: '1.0.0-beta',
      requirements: 'Windows 10 or later',
      size: '64MB',
      url: 'https://mathsketch.mos.us-south-1.sufybkt.com/MathSketch-Setup-1.0.0.exe'
    },
    {
      id: 'mac',
      name: 'macOS',
      version: 'Coming Soon',
      requirements: 'macOS 11 or later',
      size: '-',
      url: null
    },
    {
      id: 'linux',
      name: 'Linux',
      version: 'Coming Soon',
      requirements: 'Ubuntu 20.04 or later',
      size: '-',
      url: null
    }
  ];

  const features = [
    {
      title: "AI-Powered",
      description: "Get instant solutions and explanations for your math problems",
      icon: Sparkles,
      gradient: "from-purple-500 via-pink-500 to-red-500"
    },
    {
      title: "Smart Recognition",
      description: "Advanced handwriting recognition for mathematical expressions",
      icon: Brain,
      gradient: "from-green-500 via-emerald-500 to-teal-500"
    },
    {
      title: "Cross-Platform Sync",
      description: "Your work syncs automatically across all your devices",
      icon: Laptop2,
      gradient: "from-blue-500 via-cyan-500 to-teal-500"
    },
    {
      title: "Native Performance",
      description: "Enjoy faster performance and better system integration",
      icon: Zap,
      gradient: "from-amber-500 via-orange-500 to-red-500"
    },
    {
      title: "Beautiful Interface",
      description: "Clean and intuitive design that adapts to your preferences",
      icon: Palette,
      gradient: "from-indigo-500 via-purple-500 to-pink-500"
    },
    {
      title: "Real-time Collaboration",
      description: "Work together with others in real-time on math problems",
      icon: Users,
      gradient: "from-blue-500 via-indigo-500 to-purple-500"
    },
    {
      title: "Instant Feedback",
      description: "Get immediate feedback and step-by-step explanations",
      icon: Clock,
      gradient: "from-rose-500 via-pink-500 to-purple-500"
    },
    {
      title: "Secure & Private",
      description: "Your data is encrypted and protected at all times",
      icon: Shield,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500"
    },
    {
      title: "Progress Tracking",
      description: "Track your learning progress and earn achievements",
      icon: Award,
      gradient: "from-yellow-500 via-amber-500 to-orange-500"
    }
  ];

  const handleDownload = (platform: typeof platforms[0]) => {
    if (!platform.url) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = platform.url;
    link.download = `MathSketch-Setup-${platform.version}.exe`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Download MathSketch</h1>
          <p className="text-lg text-muted-foreground">
            Choose your platform and start solving math problems with AI assistance
          </p>
        </div>

        {/* Platform Tabs */}
        <Tabs defaultValue="windows" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            {platforms.map((platform) => (
              <TabsTrigger key={platform.id} value={platform.id}>
                {platform.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {platforms.map((platform) => (
            <TabsContent key={platform.id} value={platform.id}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {platform.name}
                  </CardTitle>
                  <CardDescription>
                    Version {platform.version}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">System Requirements</span>
                      <span>{platform.requirements}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Size</span>
                      <span>{platform.size}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    disabled={!platform.url}
                    onClick={() => handleDownload(platform)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {platform.url ? 'Download Now' : 'Coming Soon'}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Create an account to sync your settings and progress across devices
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div 
                className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r ${feature.gradient}`}
              />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div 
                    className={`p-2 rounded-lg bg-gradient-to-r ${feature.gradient} transform transition-transform duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription className="mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* System Requirements Note */}
        <div className="text-sm text-muted-foreground text-center">
          <p>
            For optimal performance, we recommend at least 4GB of RAM and 100MB of free disk space.
          </p>
          <p className="mt-2">
            Having trouble? <a href="/support" className="underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage; 