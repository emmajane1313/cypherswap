import { FunctionComponent } from "react";
import { BonusProps } from "../types/cypher.types";

const Bonus: FunctionComponent<BonusProps> = (): JSX.Element => {
  return (
    <div className="relative w-fit h-full flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-px">
        {Array.from({ length: 20 }).map((_, index: number) => {
          return (
            <div
              key={index}
              className="relative w-36 h-7 rounded-lg border-naranje border-2 "
              style={{
                backgroundColor: `rgb(248,255,72,${(index + 1) / 20})`,
              }}
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
