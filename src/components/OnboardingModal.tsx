import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  MousePointer2,
  PenTool,
  FileText,
  Code2,
  Share2,
  Download,
  Users,
  Sparkles,
} from 'lucide-react';

interface TourStep {
  target: string | null;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  Icon: ComponentType<{ className?: string }>;
}

const STEPS: TourStep[] = [
  {
    target: null,
    title: 'Welcome to SyncCanvas Studio',
    description:
      'A peer-to-peer collaborative workspace. No servers, no accounts — everything you draw and type syncs directly between you and your peers.',
    position: 'center',
    Icon: Sparkles,
  },
  {
    target: '[data-tour="canvas"]',
    title: 'Collaborative Whiteboard',
    description:
      'Draw freely on this infinite canvas. Every stroke syncs to your peers in real time. Their cursors appear as colored markers.',
    position: 'center',
    Icon: MousePointer2,
  },
  {
    target: '[data-tour="toolbar"]',
    title: 'Drawing Tools',
    description:
      'Switch between pen and eraser, pick a color, adjust thickness, or clear the canvas. Undo and redo are per-user — you will never revert your peers\' work.',
    position: 'top',
    Icon: PenTool,
  },
  {
    target: '[data-tour="tabs"]',
    title: 'Markdown & Code Editors',
    description:
      'Toggle between a Markdown notepad and a Code scratchpad. Both are live-synced with every peer in the room.',
    position: 'bottom',
    Icon: FileText,
  },
  {
    target: '[data-tour="editor"]',
    title: 'Live Editing',
    description:
      'Type alongside peers. Selections and cursors from other users appear as colored highlights in real-time.',
    position: 'left',
    Icon: Code2,
  },
  {
    target: '[data-tour="room-id"]',
    title: 'Share the Room',
    description:
      'Copy your Room ID and send it to anyone. They can join instantly from the landing screen. Data flows directly peer-to-peer.',
    position: 'bottom',
    Icon: Share2,
  },
  {
    target: '[data-tour="peers"]',
    title: 'Active Peers',
    description:
      'See who is currently in the room. Each peer has a unique color used for their cursor and selections.',
    position: 'bottom',
    Icon: Users,
  },
  {
    target: '[data-tour="export"]',
    title: 'Export Your Work',
    description:
      'Download the whole workspace as JSON, a clean Markdown document, or the whiteboard as a PNG image.',
    position: 'bottom',
    Icon: Download,
  },
  {
    target: null,
    title: 'You are ready to go',
    description:
      'Replay this tour anytime via the help icon in the top bar. Enjoy your collaborative session.',
    position: 'center',
    Icon: Sparkles,
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 24;
const FALLBACK_W = 320;
const FALLBACK_H = 240;

function findVisibleTarget(selector: string): Element | null {
  const nodes = document.querySelectorAll(selector);
  for (const node of Array.from(nodes)) {
    const r = node.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return node;
  }
  return null;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps): JSX.Element | null {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [tooltipSize, setTooltipSize] = useState<{ w: number; h: number }>({
    w: FALLBACK_W,
    h: FALLBACK_H,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = STEPS[stepIndex] ?? STEPS[0];

  // Fade in on open, reset index & visible on close.
  useEffect(() => {
    if (isOpen) {
      setStepIndex(0);
      const t = window.setTimeout(() => setVisible(true), 40);
      return () => window.clearTimeout(t);
    }
    setVisible(false);
    setRect(null);
    setCursorPos(null);
    return undefined;
  }, [isOpen]);

  // Track the target element's on-screen position.
  useLayoutEffect(() => {
    if (!isOpen || !step || !step.target) {
      setRect(null);
      setCursorPos(null);
      return undefined;
    }

    let cancelled = false;

    const measure = (): void => {
      if (cancelled) return;
      const el = findVisibleTarget(step.target as string);
      if (!el) {
        setRect(null);
        setCursorPos(null);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) {
        setRect(null);
        setCursorPos(null);
        return;
      }
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      setCursorPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    };

    measure();

    const observer = new ResizeObserver(measure);
    const nodes = document.querySelectorAll(step.target);
    nodes.forEach((node) => observer.observe(node));

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    const intervalId = window.setInterval(measure, 400);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      window.clearInterval(intervalId);
    };
  }, [isOpen, step]);

  // Measure the tooltip's actual size for clamping.
  useLayoutEffect(() => {
    if (!isOpen || !tooltipRef.current) return;
    const r = tooltipRef.current.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      setTooltipSize({ w: r.width, h: r.height });
    }
  }, [isOpen, stepIndex]);

  // Compute tooltip screen position.
  const tooltipStyle = useMemo<React.CSSProperties>(() => {
    if (!isOpen) return { display: 'none' };

    const enterOffset = visible ? 0 : 12;

    if (!rect || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        width: `${FALLBACK_W}px`,
        transform: `translate(-50%, calc(-50% + ${enterOffset}px))`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 300ms ease-out, transform 400ms cubic-bezier(0.34,1.2,0.64,1)',
      };
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { w: tw, h: th } = tooltipSize;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = rect.top - th - PADDING;
        left = rect.left + rect.width / 2 - tw / 2;
        break;
      case 'bottom':
        top = rect.top + rect.height + PADDING;
        left = rect.left + rect.width / 2 - tw / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.left - tw - PADDING;
        break;
      case 'right':
      default:
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.left + rect.width + PADDING;
        break;
    }

    left = Math.max(PADDING, Math.min(left, vw - tw - PADDING));
    top = Math.max(PADDING, Math.min(top, vh - th - PADDING));

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${Math.min(tw, vw - PADDING * 2)}px`,
      opacity: visible ? 1 : 0,
      transform: `translateY(${enterOffset}px)`,
      transition:
        'top 500ms cubic-bezier(0.34,1.2,0.64,1), left 500ms cubic-bezier(0.34,1.2,0.64,1), opacity 300ms ease-out, transform 400ms cubic-bezier(0.34,1.2,0.64,1)',
    };
  }, [isOpen, rect, step, visible, tooltipSize]);

  const next = useCallback(() => {
    setStepIndex((current) => {
      if (current >= STEPS.length - 1) {
        onClose();
        return current;
      }
      return current + 1;
    });
  }, [onClose]);

  const prev = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1));
  }, []);

  const skip = useCallback(() => {
    onClose();
  }, [onClose]);

  // Keyboard navigation.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        skip();
      } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, next, prev, skip]);

  if (!isOpen) return null;

  const StepIcon = step.Icon;
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Interactive tour"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1C1C1C]/85 backdrop-blur-[2px]"
        onClick={skip}
        aria-hidden
      />

      {/* Spotlight cutout around the target */}
      {rect && (
        <div
          className="absolute pointer-events-none tour-spotlight border border-narka-beige"
          style={{
            top: `${rect.top - 6}px`,
            left: `${rect.left - 6}px`,
            width: `${rect.width + 12}px`,
            height: `${rect.height + 12}px`,
            borderRadius: '2px',
            transition:
              'top 500ms cubic-bezier(0.4,0,0.2,1), left 500ms cubic-bezier(0.4,0,0.2,1), width 500ms cubic-bezier(0.4,0,0.2,1), height 500ms cubic-bezier(0.4,0,0.2,1)',
          }}
          aria-hidden
        />
      )}

      {/* Animated fake cursor */}
      {cursorPos && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0,
            left: 0,
            transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
            transition: 'transform 700ms cubic-bezier(0.34,1.56,0.64,1)',
            filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.65))',
          }}
          aria-hidden
        >
          <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
            <path
              d="M2 2L20 12L10.5 14.5L7 24L2 2Z"
              fill="#F5F5F0"
              stroke="#1C1C1C"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="absolute w-[320px] max-w-[calc(100vw-32px)] bg-[#1C1C1C] border border-narka-grey shadow-2xl"
        style={tooltipStyle}
      >
        {/* Progress bar */}
        <div className="h-0.5 bg-[#333] relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-narka-beige"
            style={{
              width: `${progress}%`,
              transition: 'width 400ms cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-narka-grey flex items-center justify-center">
                <StepIcon className="w-4 h-4 text-narka-beige" />
              </div>
              <div>
                <div className="text-[9px] tracking-widest uppercase text-narka-grey">
                  Step {stepIndex + 1} of {STEPS.length}
                </div>
                <div className="h-px w-10 bg-narka-beige mt-1.5" />
              </div>
            </div>
            <button
              type="button"
              onClick={skip}
              className="text-narka-grey hover:text-narka-light transition-colors -mt-1 -mr-1 p-1"
              aria-label="Skip tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="text-sm font-bold tracking-widest uppercase text-narka-light mb-2 leading-tight">
            {step.title}
          </h3>
          <p className="text-[11px] leading-relaxed text-narka-grey">{step.description}</p>

          {/* Dot navigation */}
          <div className="flex gap-1 mt-4">
            {STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStepIndex(idx)}
                className={`h-0.5 flex-1 ${
                  idx <= stepIndex ? 'bg-narka-beige' : 'bg-[#333]'
                }`}
                style={{ transition: 'background-color 300ms ease-out' }}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#333]">
            <button
              type="button"
              onClick={skip}
              className="text-[10px] tracking-widest uppercase text-narka-grey hover:text-narka-light transition-colors"
            >
              Skip
            </button>
            <div className="flex gap-2">
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={prev}
                  className="flex items-center gap-1 px-3 py-1.5 border border-narka-grey text-[10px] tracking-widest uppercase text-narka-light hover:border-narka-light transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              )}
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-1 px-3 py-1.5 bg-narka-beige text-narka-dark text-[10px] tracking-widest uppercase font-bold hover:bg-[#c4b4a6] transition-colors"
              >
                {stepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}{' '}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
