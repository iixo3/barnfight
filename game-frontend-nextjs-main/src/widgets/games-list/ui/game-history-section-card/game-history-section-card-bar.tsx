import React, { useCallback, useEffect, useMemo, useState } from "react";

type GameHistorySectionCardBarProps = {
  start_date: number;
  end_date: number;
};

const GameHistorySectionCardBar: React.FC<GameHistorySectionCardBarProps> = ({
  start_date,
  end_date,
}) => {
  const [percentage, setPercentage] = useState<number>(0);

  const startTime = useMemo(() => new Date(start_date * 1000), [start_date]);
  const endTime = useMemo(() => new Date(end_date * 1000), [end_date]);

  const calculatePercentage = useCallback(() => {
    const currentTime = new Date().getTime();
    const totalDuration = endTime.getTime() - startTime.getTime();
    const elapsedTime = currentTime - startTime.getTime();

    if (currentTime < startTime.getTime()) {
      setPercentage(0);
    } else if (elapsedTime >= totalDuration) {
      setPercentage(100);
    } else {
      const progress = (elapsedTime / totalDuration) * 100;
      setPercentage(progress);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    const intervalId = setInterval(calculatePercentage, 1000);
    calculatePercentage();

    return () => clearInterval(intervalId);
  }, [calculatePercentage]);

  return (
    <div className="w-full bg-component-highlight rounded-full overflow-hidden h-[7px]">
      <div
        className="rounded-full h-full bg-gradient-to-br from-brand-gradient-green-1 to-brand-gradient-green-2"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default GameHistorySectionCardBar;
