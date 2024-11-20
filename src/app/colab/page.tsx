'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'qrcode';

export default function ColabPage() {
  const [sessionId, setSessionId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const router = useRouter();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async (text: string) => {
    try {
      // Create a canvas element
      const canvas = qrCanvasRef.current;
      if (!canvas) return;

      // Generate QR code
      await QRCode.toCanvas(canvas, text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#FFFFFF',
          light: '#00000000'
        }
      });

      // Get canvas context
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load app logo
      const logo = new Image();
      logo.src = '/logo.png'; // Make sure to add your logo in the public folder
      
      logo.onload = () => {
        // Calculate logo size (25% of QR code size)
        const logoSize = canvas.width * 0.25;
        const logoX = (canvas.width - logoSize) / 2;
        const logoY = (canvas.height - logoSize) / 2;

        // Create circular clip for logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();

        // Draw logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        ctx.restore();

        // Add glow effect
        ctx.shadowColor = 'rgba(0, 204, 255, 0.8)';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = 'rgba(0, 204, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Update QR code URL
        setQrCodeUrl(canvas.toDataURL());
      };
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  const createNewSession = () => {
    const newSessionId = uuidv4();
    generateQRCode(`${window.location.origin}/colab/${newSessionId}`);
    router.push(`/colab/${newSessionId}`);
  };

  const joinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      router.push(`/colab/${sessionId}`);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);
      setShowScanner(true);
    } catch (error) {
      console.error('Camera permission denied:', error);
      setCameraPermission(false);
      alert('Camera access is required to scan QR codes. Please enable camera access and try again.');
    }
  };

  const handleScanClick = () => {
    if (showScanner) {
      setShowScanner(false);
    } else {
      if (cameraPermission === null) {
        requestCameraPermission();
      } else if (cameraPermission) {
        setShowScanner(true);
      } else {
        alert('Camera access is required to scan QR codes. Please enable camera access in your browser settings.');
      }
    }
  };

  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const startScanner = async () => {
      if (showScanner) {
        html5QrCode = new Html5Qrcode("reader");
        try {
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length) {
            await html5QrCode.start(
              { facingMode: "environment" },
              {
                fps: 10,
                qrbox: { width: 250, height: 250 }
              },
              (decodedText) => {
                console.log(decodedText);
                setSessionId(decodedText);
                html5QrCode.stop();
                setShowScanner(false);
                router.push(`/colab/${decodedText}`);
              },
              (error) => {
                // Ignore errors during scanning
              }
            );
          }
        } catch (err) {
          console.error("Error starting scanner:", err);
        }
      }
    };

    startScanner();

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, [showScanner, router]);

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="relative">
          <div className="text-9xl font-bold text-gray-700 opacity-10 tracking-widest glow-text">
            <span className="glow-letter">M</span>
            <span className="glow-letter">A</span>
            <span className="glow-letter">T</span>
            <span className="glow-letter">H</span>
            <span className="glow-letter">S</span>
            <span className="glow-letter">K</span>
            <span className="glow-letter">E</span>
            <span className="glow-letter">T</span>
            <span className="glow-letter">C</span>
            <span className="glow-letter">H</span>
          </div>
        </div>
      </div>
      <div className="relative z-10 bg-gray-800 bg-opacity-30 backdrop-blur-lg p-10 rounded-xl shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-white">Join Collaborative Session</h1>
        
        <form onSubmit={joinSession} className="space-y-6">
          <div>
            <label htmlFor="sessionId" className="block text-sm font-semibold text-gray-300">
              Session ID
            </label>
            <input
              type="text"
              id="sessionId"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="mt-2 block w-full rounded-lg border-gray-600 bg-gray-700 text-white shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none neon-border text-lg py-3 px-4"
              placeholder="Enter session ID"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-300"
          >
            Join Session
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <button
            onClick={createNewSession}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300"
          >
            Create New Session
          </button>

          <button
            onClick={handleScanClick}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
          >
            {showScanner ? 'Close Scanner' : 'Scan QR Code'}
          </button>
        </div>

        {/* Hidden canvas for QR code generation */}
        <canvas ref={qrCanvasRef} className="hidden" />

        {/* Display generated QR code */}
        {qrCodeUrl && (
          <div className="mt-6 flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <img 
                src={qrCodeUrl} 
                alt="Session QR Code" 
                className="w-64 h-64 object-contain"
              />
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Scan this QR code to join the session
            </p>
          </div>
        )}

        {showScanner && (
          <div id="reader" className="mt-6 rounded-lg overflow-hidden"></div>
        )}

        {cameraPermission === false && (
          <p className="mt-4 text-red-500 text-sm text-center">
            Camera access denied. Please enable camera access in your browser settings to scan QR codes.
          </p>
        )}
      </div>
      <style jsx>{`
        .glow-letter {
          display: inline-block;
          animation: glow 10s infinite;
          animation-delay: calc(var(--i) * 1s);
          color: rgba(255, 255, 255, 0.1);
          text-shadow: 0 0 20px rgba(0, 204, 255, 0.8), 0 0 30px rgba(0, 204, 255, 0.8);
        }

        .glow-letter:nth-child(1) { --i: 0; }
        .glow-letter:nth-child(2) { --i: 1; }
        .glow-letter:nth-child(3) { --i: 2; }
        .glow-letter:nth-child(4) { --i: 3; }
        .glow-letter:nth-child(5) { --i: 4; }
        .glow-letter:nth-child(6) { --i: 5; }
        .glow-letter:nth-child(7) { --i: 6; }
        .glow-letter:nth-child(8) { --i: 7; }
        .glow-letter:nth-child(9) { --i: 8; }
        .glow-letter:nth-child(10) { --i: 9; }

        @keyframes glow {
          0%, 100% {
            color: rgba(255, 255, 255, 0.1);
            text-shadow: 0 0 20px rgba(0, 204, 255, 0.8), 0 0 30px rgba(0, 204, 255, 0.8);
          }
          50% {
            color: rgba(0, 204, 255, 1);
            text-shadow: 0 0 30px rgba(0, 204, 255, 1), 0 0 40px rgba(0, 204, 255, 1);
          }
        }

        .neon-border:focus {
          box-shadow: 0 0 10px rgba(0, 204, 255, 0.8), 0 0 20px rgba(0, 204, 255, 0.8);
        }

        #reader {
          width: 100% !important;
          background: #1f2937;
        }

        #reader video {
          width: 100% !important;
          border-radius: 0.5rem;
        }

        #reader * {
          border: none !important;
        }
      `}</style>
    </div>
  );
}