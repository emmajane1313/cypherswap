import { FunctionComponent, useEffect } from "react";
import { BonusProps } from "../types/cypher.types";

const Bonus: FunctionComponent<BonusProps> = ({
  filledBars,
  collected,
  setFilledBars,
  claimBonus,
}): JSX.Element => {
  useEffect(() => {
    setTimeout(() => {
      if (collected && filledBars < 20) {
        const timer = setTimeout(() => {
          setFilledBars(((prev: number) => {
            prev + 1;
          }) as any);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, 4000);
  }, [collected, filledBars]);
  return (
    <div className="relative w-fit h-full flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-px">
        {Array.from({ length: 20 }).map((_, index: number) => {
          return (
            <div
              key={index}
              className="relative w-36 h-7 rounded-lg border-naranje border-2 "
              id={`bar ${index < filledBars ? "bar-filled" : ""}`}
            ></div>
          );
        })}
      </div>
      <div className="relative w-full h-20 font-on text-white text-center text-5xl leading-10 flex items-center justify-center break-words">
        BONUS AVAILABLE
      </div>
    </div>
  );
};

export default Bonus;
