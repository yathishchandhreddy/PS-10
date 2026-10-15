import React, { useState, useEffect, useRef } from 'react';

interface LoginScreenProps {
  onLogin: (userName: string, userRole: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [userName, setUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState('Resident / Property Owner');
  const [isWarping, setIsWarping] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // The cosmic starry water background provided by user (image.png)
  const cosmicWaterBgUrl =
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2400&auto=format&fit=crop';

  // Interactive Canvas: Warp Stars, Shooting Meteors, and Water Shimmer Waves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Stars
    interface Star {
      x: number;
      y: number;
      z: number;
      size: number;
      baseColor: string;
      speed: number;
    }

    const starCount = 130;
    const stars: Star[] = [];
    const colors = ['#4cd7f6', '#4fdbc8', '#ffffff', '#acedff', '#d0bcff'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * width,
        size: Math.random() * 1.8 + 0.4,
        baseColor: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.8 + 0.4,
      });
    }

    // Shooting Meteors
    interface Meteor {
      x: number;
      y: number;
      len: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
    }

    const meteors: Meteor[] = [];
    const spawnMeteor = () => {
      meteors.push({
        x: Math.random() * width * 0.85,
        y: Math.random() * (height * 0.4),
        len: Math.random() * 70 + 45,
        speed: Math.random() * 6 + 8,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        opacity: 1,
        active: true,
      });
    };

    let meteorTimer = 0;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.45;

      // Draw Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        s.z -= isWarping ? s.speed * 12 : s.speed;
        if (s.z <= 0) {
          s.z = width;
          s.x = (Math.random() - 0.5) * width * 1.5;
          s.y = (Math.random() - 0.5) * height * 1.5;
        }

        const k = 250 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthAlpha = Math.min(1, Math.max(0.1, (1 - s.z / width) * 1.3));
          ctx.beginPath();
          ctx.arc(px, py, s.size * (isWarping ? 1.5 : 1), 0, Math.PI * 2);
          ctx.fillStyle = s.baseColor;
          ctx.globalAlpha = depthAlpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = s.baseColor;
          ctx.fill();

          // Warp streaks when entering
          if (isWarping) {
            const prevK = 250 / (s.z + 40);
            const prevPx = s.x * prevK + cx;
            const prevPy = s.y * prevK + cy;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(prevPx, prevPy);
            ctx.strokeStyle = s.baseColor;
            ctx.lineWidth = s.size;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Meteors
      meteorTimer++;
      if (meteorTimer % 100 === 0 && Math.random() > 0.3) {
        spawnMeteor();
      }

      for (let m = meteors.length - 1; m >= 0; m--) {
        const meteor = meteors[m];
        if (!meteor.active) continue;

        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.opacity -= 0.015;

        if (meteor.opacity <= 0 || meteor.x > width || meteor.y > height) {
          meteor.active = false;
          meteors.splice(m, 1);
          continue;
        }

        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.len;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.len;

        const grad = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
        grad.addColorStop(0, 'rgba(76, 215, 246, 0)');
        grad.addColorStop(0.8, 'rgba(79, 219, 200, 0.7)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 1)');

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(meteor.x, meteor.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Water Shimmer Waves
      const waterY = height * 0.58;
      ctx.strokeStyle = 'rgba(76, 215, 246, 0.08)';
      ctx.lineWidth = 1;

      for (let w = 0; w < 4; w++) {
        const lineY = waterY + w * 35;
        ctx.beginPath();
        for (let x = 0; x < width; x += 30) {
          const waveHeight = Math.sin((x + Date.now() * 0.05 + w * 60) * 0.02) * (3 + w);
          if (x === 0) ctx.moveTo(x, lineY + waveHeight);
          else ctx.lineTo(x, lineY + waveHeight);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isWarping]);

  const handleLaunch = () => {
    setIsWarping(true);
    setTimeout(() => {
      onLogin(userName.trim() || 'Explorer', selectedRole);
    }, 900);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#050814] select-none">
      {/* 1. Base User Image (image.png - Cosmic Starry Sky over Water) */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
          isWarping ? 'scale-110 filter brightness-125' : 'scale-100'
        }`}
        style={{
          backgroundImage: `url(${cosmicWaterBgUrl})`,
        }}
      />

      {/* 2. Deep Cosmic Obsidian Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e1321] via-[#090e1c]/70 to-[#0e1321]/80 pointer-events-none" />

      {/* 3. Luminous Horizon Flare matching image.png */}
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-24 bg-gradient-to-r from-transparent via-[#4cd7f6]/25 to-transparent blur-3xl pointer-events-none" />

      {/* 4. Interactive Canvas Layer (Warp Stars, Meteors, Water Shimmer) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-none"
      />

      {/* 5. Main Hero Card */}
      <div
        className={`relative z-20 w-full max-w-xl mx-auto flex flex-col items-center transition-all duration-700 ${
          isWarping ? 'opacity-0 scale-95 -translate-y-6' : 'opacity-100 scale-100'
        }`}
      >
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#090e1c]/90 border border-[#4cd7f6]/40 shadow-[0_0_24px_rgba(76,215,246,0.3)] backdrop-blur-xl">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1XDuaGwYbhktFh88KJACJydQqZsbrcgQOuZKb_v3A96ZHWRjk5CX10oeOW1m_U9TyWbxqh7I-AZ9jIQRgXJWgnMyeeui8B1a_af68gJn8uYgcR3o3NA3JkNLVUjsIPuBug-xUrG7XFBSNZ9CbeyFce55fBp9l7NlvnRCy-ps2aFjMHmBT6zIrYi-6_Pay01F0zydjzavq1LNCxzf7lzYekrHrWdC9s2w6mOnDOmrvXFTiMOL9n3WxTM80gt"
              alt="RiskLens TN Logo"
              className="h-6 w-auto object-contain"
            />
            <span className="font-space font-extrabold text-white text-xs tracking-widest uppercase">
              RISKLENS <span className="text-[#4cd7f6]">TN</span>
            </span>
          </div>

          <h1 className="font-space font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight drop-shadow-[0_0_30px_rgba(76,215,246,0.35)]">
            Catastrophe Risk <br />
            <span className="bg-gradient-to-r from-[#4cd7f6] via-[#4fdbc8] to-[#d0bcff] bg-clip-text text-transparent">
              Intelligence Platform
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#bcc9cd] max-w-md mx-auto leading-relaxed pt-1">
            Hyperlocal disaster risk exploration, physical property loss quantification, and indicative insurance pricing for Tamil Nadu.
          </p>
        </div>

        {/* Clean Glassmorphic Card */}
        <div className="w-full bg-[#0e1321]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] space-y-6">
          <div className="space-y-4">
            {/* Optional Name Input */}
            <div>
              <label className="block text-xs font-mono text-[#bcc9cd] uppercase tracking-wider mb-2">
                Your Name (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4cd7f6]">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </span>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g., Chennai Resident"
                  className="w-full pl-10 pr-4 py-3 bg-[#090e1c] border border-[#252a39] focus:border-[#4cd7f6] rounded-xl text-sm text-white placeholder-[#869397] outline-none transition-all shadow-inner font-sans"
                />
              </div>
            </div>

            {/* Role Selection Matrix */}
            <div>
              <label className="block text-xs font-mono text-[#bcc9cd] uppercase tracking-wider mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'Resident / Property Owner',
                    icon: 'home',
                    desc: 'Home & asset safety',
                  },
                  {
                    id: 'Insurance Underwriter',
                    icon: 'verified_user',
                    desc: 'Tariff & risk pricing',
                  },
                  {
                    id: 'Catastrophe Risk Modeler',
                    icon: 'analytics',
                    desc: 'Topographic hazard data',
                  },
                  {
                    id: 'Emergency Responder',
                    icon: 'emergency',
                    desc: 'Evacuation & preparedness',
                  },
                ].map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#4cd7f6]/15 border-[#4cd7f6] shadow-[0_0_20px_rgba(76,215,246,0.25)]'
                          : 'bg-[#090e1c] border-[#252a39] hover:border-[#303444]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isSelected ? 'text-[#4cd7f6]' : 'text-[#869397]'
                            }`}
                          >
                            {role.icon}
                          </span>
                          <span
                            className={`font-space font-bold text-xs block ${
                              isSelected ? 'text-white' : 'text-[#dee2f6]'
                            }`}
                          >
                            {role.id.split('/')[0]}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#869397] truncate block font-sans">
                        {role.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLaunch}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#06b6d4] via-[#4cd7f6] to-[#04b4a2] hover:brightness-110 text-[#003640] font-space font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(76,215,246,0.5)] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <span className="tracking-wide">Enter Platform</span>
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
