"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Muted product demo that plays only while visible and never autoplays for reduced-motion users. */
export function DemoVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) userPaused.current = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) video.play().catch(() => {});
        else if (!entry.isIntersecting) video.pause();
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-[2rem] border border-line bg-surface shadow-2xl shadow-black/40">
      <video
        ref={ref}
        className="block aspect-[9/16] w-full"
        poster="/demo/oplacik-demo-poster.jpg"
        muted
        loop
        playsInline
        preload="none"
        aria-label="Pokaz działania Opłacika: przypomnienie o płatności, pulpit z sumami, okres próbny, wykryta podwyżka ceny i kalendarz płatności"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/demo/oplacik-demo.mp4" type="video/mp4" />
        <source src="/demo/oplacik-demo.webm" type="video/webm" />
      </video>
      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
        aria-label={playing ? "Zatrzymaj film" : "Odtwórz film"}
      >
        {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
