import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * "Waiting" signal while a new page opens: gold arrows blink at both screen
 * edges, like a car's hazard lights, with the relay's tick-tock when the
 * navigation came from a click or key press. The sound is synthesised with
 * Web Audio (no files) and only plays after such a gesture — browsers block
 * page sound before the visitor interacts, so a reload shows the arrows
 * only (index.html has the same arrows for the first load).
 *
 * One full blink (0.66s) always plays, so a fast page change still reads as
 * a deliberate beat rather than a flicker.
 */
const CYCLE_MS = 660;

let audio: AudioContext | null = null;

/** One relay click: a short noise burst through a band-pass filter. */
function relay(at: number, freq: number, gain: number) {
  if (!audio) return;
  const len = Math.floor(audio.sampleRate * 0.028);
  const buf = audio.createBuffer(1, len, audio.sampleRate);
  const data = buf.getChannelData(0);
  for (let k = 0; k < len; k++) data[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / len, 5);
  const src = audio.createBufferSource();
  src.buffer = buf;
  const band = audio.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = freq;
  band.Q.value = 2.5;
  const g = audio.createGain();
  g.gain.value = gain;
  src.connect(band).connect(g).connect(audio.destination);
  src.start(at);
}

function tickTock() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audio ||= new Ctx();
    if (audio.state === "suspended") void audio.resume();
    const t0 = audio.currentTime + 0.01;
    relay(t0, 2600, 0.35);
    relay(t0 + CYCLE_MS / 2000, 1500, 0.25);
  } catch {
    /* no sound available */
  }
}

export function TurnSignal() {
  const router = useRouter();
  const [on, setOn] = useState(false);

  useEffect(() => {
    let lastGesture = -Infinity;
    let startedAt = 0;
    let active = false;
    let beat: number | undefined;
    let off: number | undefined;

    const markGesture = () => {
      lastGesture = performance.now();
    };

    const start = () => {
      window.clearTimeout(off);
      if (active) return;
      active = true;
      startedAt = performance.now();
      setOn(true);
      if (performance.now() - lastGesture < 1500) {
        tickTock();
        beat = window.setInterval(tickTock, CYCLE_MS);
      }
    };

    const stop = () => {
      if (!active) return;
      const wait = Math.max(0, CYCLE_MS - (performance.now() - startedAt));
      off = window.setTimeout(() => {
        active = false;
        window.clearInterval(beat);
        setOn(false);
      }, wait);
    };

    document.addEventListener("pointerdown", markGesture, true);
    document.addEventListener("keydown", markGesture, true);
    const unsubStart = router.subscribe("onBeforeNavigate", (e) => {
      if (e.pathChanged) start();
    });
    const unsubStop = router.subscribe("onResolved", stop);

    return () => {
      document.removeEventListener("pointerdown", markGesture, true);
      document.removeEventListener("keydown", markGesture, true);
      unsubStart();
      unsubStop();
      window.clearInterval(beat);
      window.clearTimeout(off);
    };
  }, [router]);

  return (
    <div className="turn-signal" data-on={on || undefined} aria-hidden>
      <i />
      <i />
    </div>
  );
}
