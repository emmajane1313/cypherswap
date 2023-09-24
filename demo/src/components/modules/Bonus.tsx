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
      if (collected && filledBars < 18) {
        const timer = setTimeout(() => {
          setFilledBars(((prev: number) => {
            return prev + 1;
          }) as any);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, 4000);
  }, [collected, filledBars]);

  return (
    <div
      className={`relative w-fit h-full flex flex-col items-center justify-center gap-3 ${
        !collected && "opacity-50"
      }`}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-px">
        {Array.from({ length: 18 }).map((_, index: number) => {
          const opacity = (index + 2) * 0.05;
          return (
            <div
              // key={index}
              // className="relative w-full h-8 rounded-lg border-sol border-2 "
              // style={{ backgroundColor: index < filledBars ? 'rgb(248, 255, 72)' : 'transparent' }}
              // id={`bonus-${index}`}
              // key={index}
              // className={`relative w-full h-8 rounded-lg border-sol border-2  ${
              //   collected ? "bonusAnimation" : ""
              // }`}
              // style={{
              //   backgroundColor: `rgb(248, 255, 72, ${ collected ?opacity : 0})`,
              //   // opacity: opacity
              // }}
              key={index}
              className={`relative w-full h-8 rounded-lg noFillbonus ${
                collected ? "filledBonus" : ""
              }`}
              style={{
                backgroundColor: `rgba(248, 255, 72, ${
                  collected ? opacity : 0
                })`,
              }}
            ></div>
          );
        })}
      </div>
      <div
        className={`relative w-full h-16 font-on text-white text-center leading-7 flex text-4xl items-center justify-center break-words ${
          collected &&
          "border border-white rounded-lg cursor-pointer active:scale-95"
        }`}
        onClick={() => collected && claimBonus()}
      >
        {!collected ? "BONUS AVAILABLE" : "CLAIM & SWAP BONUS"}
      </div>
    </div>
  );
};

export default Bonus;
