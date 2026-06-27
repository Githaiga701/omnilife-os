"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";

export function AnimatedBackground() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const blobColors = isDark
    ? {
        purple: "rgba(139, 92, 246, 0.3)",
        blue: "rgba(59, 130, 246, 0.3)",
        cyan: "rgba(6, 182, 212, 0.2)",
        pink: "rgba(236, 72, 153, 0.2)",
      }
    : {
        purple: "rgba(167, 139, 250, 0.25)",
        blue: "rgba(147, 197, 253, 0.25)",
        cyan: "rgba(103, 232, 249, 0.2)",
        pink: "rgba(249, 168, 212, 0.2)",
      };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base background with smooth transition */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ backgroundColor: isDark ? "#0a0a0f" : "#fafafa" }}
      />

      {/* LAYER 1: Main flowing blobs */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] animate-blob-1"
          style={{
            background: `radial-gradient(circle, ${blobColors.purple} 0%, transparent 70%)`,
            transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03 + scrollPosition * 0.1}px)`,
            transition: "transform 0.4s ease-out",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] animate-blob-2"
          style={{
            background: `radial-gradient(circle, ${blobColors.blue} 0%, transparent 70%)`,
            transform: `translate(${-mousePosition.x * 0.03}px, ${mousePosition.y * 0.03 - scrollPosition * 0.1}px)`,
            transition: "transform 0.4s ease-out",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] animate-blob-3"
          style={{
            background: `radial-gradient(circle, ${blobColors.cyan} 0%, transparent 70%)`,
            transform: `translate(-50%, ${scrollPosition * -0.15}px)`,
            transition: "transform 0.4s ease-out",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] animate-blob-4"
          style={{
            background: `radial-gradient(circle, ${blobColors.pink} 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* LAYER 2: Floating geometric shapes */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border opacity-20 animate-spin-slow"
          style={{
            borderColor: isDark ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.2)",
            transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
            transition: "transform 0.6s ease-out",
          }}
        />

        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full border opacity-15 animate-spin-slow-reverse"
          style={{
            borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)",
            transform: `translate(${-mousePosition.x * 0.05}px, ${-mousePosition.y * 0.05}px)`,
            transition: "transform 0.6s ease-out",
          }}
        />

        <div
          className="absolute top-1/2 right-1/3 w-20 h-20 opacity-20 animate-float-1"
          style={{
            background: `linear-gradient(135deg, ${blobColors.purple}, transparent)`,
            transform: `rotate(45deg) translate(${mousePosition.x * 0.08}px, ${mousePosition.y * 0.08}px)`,
            transition: "transform 0.5s ease-out",
            borderRadius: "4px",
          }}
        />

        <div
          className="absolute top-1/3 left-2/3 w-16 h-16 rounded-full opacity-20 animate-float-2"
          style={{
            background: `radial-gradient(circle, ${blobColors.cyan}, transparent)`,
            transform: `translate(${-mousePosition.x * 0.08}px, ${mousePosition.y * 0.08}px)`,
            transition: "transform 0.5s ease-out",
          }}
        />

        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 animate-spin-very-slow">
          <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-purple-400 opacity-40 blur-[1px]" />
          <div className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full bg-blue-400 opacity-40 blur-[1px]" />
          <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-cyan-400 opacity-40 blur-[1px]" />
          <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-pink-400 opacity-40 blur-[1px]" />
        </div>
      </div>

      {/* LAYER 3: Subtle grid overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: isDark ? 0.03 : 0.04,
          backgroundImage: `
            linear-gradient(rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: `translateY(${scrollPosition * -0.05}px)`,
        }}
      />

      {/* LAYER 4: Shooting stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-40 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 animate-shooting-star-1" />
        <div className="absolute top-2/3 -left-20 w-40 h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 animate-shooting-star-2" />
        <div className="absolute top-1/2 -left-20 w-40 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 animate-shooting-star-3" />
      </div>

      {/* LAYER 5: Noise texture for depth */}
      <div
        className="absolute inset-0 mix-blend-overlay transition-opacity duration-700"
        style={{
          opacity: isDark ? 0.015 : 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* LAYER 6: Vignette */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: isDark ? 1 : 0.5,
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)",
        }}
      />
    </div>
  );
}
