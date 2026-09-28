import Spinner from "./Spinner";

/** Lightweight placeholder shown while a lazily loaded page or the session is loading. */
export default function PageLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div className={`flex w-full items-center justify-center ${fullScreen ? "min-h-screen" : "min-h-[40vh]"}`}>
      <Spinner size="h-8 w-8" />
    </div>
  );
}
