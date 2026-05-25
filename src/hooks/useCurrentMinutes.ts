import { useEffect, useState } from "react";
import { minutesNow } from "@/lib/time";

export const useCurrentMinutes = () => {
  const [m, setM] = useState(() => minutesNow());
  useEffect(() => {
    const tick = () => setM(minutesNow());
    tick();
    const i = setInterval(tick, 30_000);
    return () => clearInterval(i);
  }, []);
  return m;
};
