import { FunctionComponent } from "react";
import { HeaderProps } from "../types/cypher.types";
import Image from "next/image";
import { INFURA_GATEWAY } from "../../../lib/constants";

const Header: FunctionComponent<HeaderProps> = ({
  signIn,
  openConnectModal,
  profile,
}): JSX.Element => {
  return (
    <div className="relative w-full h-fit flex p-3">
      <div className="relative w-fit h-fit mr-auto items-center justify-center flex flex-col font-air text-3xl text-white">
        <div className="relative w-fit h-fit items-center justify-center flex">
          Cypher
        </div>
        <div className="relative w-fit h-fit items-center justify-center flex left-8">
          Swap
        </div>
      </div>
      <div
        className="relative w-fit h-fit flex items-center justify-center ml-auto text-white cursor-pointer font-air"
        onClick={() => signIn()}
        // onClick={openConnectModal}
      >
        <Image
          src={`${INFURA_GATEWAY}/ipfs/QmbYTrvTj2CY9uVZjVNz61wQ2Qn7nzF1hQVhe9b6aLZvpJ`}
          width={100}
          height={20}
          alt="ethglobal"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default Header;
