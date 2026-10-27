import { Button } from "@/shared/ui/components/button/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        background: `
    repeating-radial-gradient(#000 0 0.0001%, #2d2d2d 0 0.0002%) 50% 0/2500px 2500px,
    repeating-conic-gradient(#000 0 0.0001%, #2d2d2d 0 0.0002%) 60% 60%/2500px 2500px
  `,
        backgroundBlendMode: "difference",
        animation: "noise 0.2s infinite alternate",
      }}
      className="min-h-view flex-grow rounded-3xl h-full w-full flex items-center justify-center"
    >
      <div className="flex flex-col gap-y-10 items-center justify-center">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <span className="font-bold font-handjet leading-[80%] text-white !text-[clamp(30px,40vw,100px)]">
            404
          </span>
          <span className="font-handjet font-bold text-[32px] text-text-secondary">
            Page not found
          </span>
        </div>

        <Button asChild variant="action" size="lg">
          <Link href="/games">Go to games</Link>
        </Button>
      </div>
    </div>
  );
}
