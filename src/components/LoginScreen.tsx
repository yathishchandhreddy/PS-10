import React, { useState, useEffect, useRef } from 'react';

interface LoginScreenProps {
  onLogin: (userName: string, userRole: string) => void;
  onReplayIntro?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onReplayIntro }) => {
  const [userName, setUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState('Property Owner');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // The cosmic starry water background provided by user (image.png)
  const cosmicWaterBgUrl =
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2400&auto=format&fit=crop';

  // Interactive Canvas: Light Warp Stars, Shooting Meteors, and Water Shimmer
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

    interface Star {
      x: number;
      y: number;
      z: number;
      size: number;
      baseColor: string;
      speed: number;
    }

    const starCount = 110;
    const stars: Star[] = [];
    const colors = ['#0EA5E9', '#0D9488', '#059669', '#38BDF8', '#6EE7B7'];

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
        opacity: 0.9,
        active: true,
      });
    };

    let meteorTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.45;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        s.z -= s.speed;
        if (s.z <= 0) {
          s.z = width;
          s.x = (Math.random() - 0.5) * width * 1.5;
          s.y = (Math.random() - 0.5) * height * 1.5;
        }

        const k = 250 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthAlpha = Math.min(1, Math.max(0.15, (1 - s.z / width) * 1.2));
          ctx.beginPath();
          ctx.arc(px, py, s.size, 0, Math.PI * 2);
          ctx.fillStyle = s.baseColor;
          ctx.globalAlpha = depthAlpha;
          ctx.shadowBlur = 4;
          ctx.shadowColor = s.baseColor;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      meteorTimer++;
      if (meteorTimer % 110 === 0 && Math.random() > 0.3) {
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
        grad.addColorStop(0, 'rgba(13, 148, 136, 0)');
        grad.addColorStop(0.8, 'rgba(5, 150, 105, 0.7)');
        grad.addColorStop(1, 'rgba(14, 165, 233, 1)');

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(meteor.x, meteor.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Water Shimmer Waves
      const waterY = height * 0.6;
      ctx.strokeStyle = 'rgba(13, 148, 136, 0.12)';
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
  }, []);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLaunch = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onLogin(userName.trim() || 'Explorer', selectedRole);
    }, 400);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#F8FAFC] select-none font-sans animate-fadeIn">
      {/* 1. Base User Image (image.png - Cosmic Starry Sky over Water) */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
          isTransitioning ? 'opacity-70 scale-102' : 'opacity-100 scale-100'
        }`}
        style={{
          backgroundImage: `url(${cosmicWaterBgUrl})`,
        }}
      />

      {/* 2. Soft Luminous Light Geospatial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/85 to-white/90 pointer-events-none" />

      {/* 3. Luminous Emerald & Teal Horizon Glow */}
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-24 bg-gradient-to-r from-transparent via-[#0D9488]/15 to-transparent blur-3xl pointer-events-none" />

      {/* 4. Interactive Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-none"
      />

      {/* Top Controls: Replay Intro button */}
      {onReplayIntro && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
          <button
            type="button"
            onClick={onReplayIntro}
            className="px-3.5 py-1.5 rounded-full bg-white/95 border border-[#CBD5E1] hover:border-[#059669] text-xs font-mono text-[#1E293B] hover:text-[#059669] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#059669]">replay</span>
            <span>Replay Intro</span>
          </button>
        </div>
      )}

      {/* 5. Main Hero Card */}
      <div
        className={`relative z-20 w-full max-w-xl mx-auto flex flex-col items-center transition-all duration-500 ease-out ${
          isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-sm backdrop-blur-xl">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1XDuaGwYbhktFh88KJACJydQqZsbrcgQOuZKb_v3A96ZHWRjk5CX10oeOW1m_U9TyWbxqh7I-AZ9jIQRgXJWgnMyeeui8B1a_af68gJn8uYgcR3o3NA3JkNLVUjsIPuBug-xUrG7XFBSNZ9CbeyFce55fBp9l7NlvnRCy-ps2aFjMHmBT6zIrYi-6_Pay01F0zydjzavq1LNCxzf7lzYekrHrWdC9s2w6mOnDOmrvXFTiMOL9n3WxTM80gt"
              alt="RiskLens TN Logo"
              className="h-6 w-auto object-contain"
            />
            <span className="font-space font-extrabold text-[#1E293B] text-xs tracking-widest uppercase">
              RISKLENS <span className="text-[#059669]">TN</span>
            </span>
          </div>

          <h1 className="font-space font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#1E293B] tracking-tight">
            Catastrophe Risk <br />
            <span className="bg-gradient-to-r from-[#059669] via-[#0D9488] to-[#0EA5E9] bg-clip-text text-transparent">
              Intelligence Platform
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed pt-1">
            Hyperlocal disaster risk exploration, physical property loss quantification, and indicative insurance pricing for Tamil Nadu.
          </p>
        </div>

        {/* Clean Light Card */}
        <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] space-y-6">
          {/* Truth-in-Labeling: Prototype Access Mode Notice */}
          <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl flex items-start gap-2.5 text-xs text-[#166534]">
            <span className="material-symbols-outlined text-[18px] text-[#059669] shrink-0 mt-0.5">
              verified
            </span>
            <div className="leading-relaxed">
              <strong className="font-semibold">Prototype Access Mode: </strong>
              Select a stakeholder role below to configure customized perspectives for risk exploration, loss estimation, and indicative pricing.
            </div>
          </div>

          <div className="space-y-4">
            {/* Optional Name Input */}
            <div>
              <label className="block text-xs font-mono text-[#64748B] uppercase tracking-wider mb-2 font-semibold">
                Your Name / Organization (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#059669]">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </span>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g., Chennai Resident / Asset Manager"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#059669] focus:bg-white rounded-xl text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none transition-all shadow-inner font-sans"
                />
              </div>
            </div>

            {/* Role Selection Matrix (The 4 Specified Roles) */}
            <div>
              <label className="block text-xs font-mono text-[#64748B] uppercase tracking-wider mb-2 font-semibold">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'Property Owner',
                    icon: 'home',
                    desc: 'Home, villa & asset safety',
                  },
                  {
                    id: 'Insurance Professional',
                    icon: 'verified_user',
                    desc: 'Underwriting & risk pricing',
                  },
                  {
                    id: 'Government Official',
                    icon: 'account_balance',
                    desc: 'TNSDMA & mitigation planning',
                  },
                  {
                    id: 'Catastrophe Risk Analyst',
                    icon: 'analytics',
                    desc: 'Spatial hazard modeling',
                  },
                ].map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#ECFDF5] border-[#059669] text-[#059669] shadow-sm'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isSelected ? 'text-[#059669]' : 'text-[#64748B]'
                            }`}
                          >
                            {role.icon}
                          </span>
                          <span
                            className={`font-space font-bold text-xs block ${
                              isSelected ? 'text-[#059669]' : 'text-[#1E293B]'
                            }`}
                          >
                            {role.id}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#64748B] truncate block font-sans">
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
              className="w-full py-4 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-space font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(5,150,105,0.25)] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <span className="tracking-wide">Launch Workspace</span>
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
