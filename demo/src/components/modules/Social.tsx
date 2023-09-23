import Image from "next/legacy/image";
import { FunctionComponent } from "react";
import { INFURA_GATEWAY } from "../../../lib/constants";

const Social: FunctionComponent = (): JSX.Element => {
  return (
    <div className="relative w-full h-32 flex px-5">
      <div className="relative w-full h-full flex items-center justify-center border-sol border rounded-lg">
        <Image
          src={`${INFURA_GATEWAY}/ipfs/QmRc7cQ3sB2sBkPRZRwG15PSqE2TnzBjutzVTvKQFwd1NA`}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default Social;
