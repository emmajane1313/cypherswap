import { exec } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  exec("npx hardhat node", (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: "Failed to fetch account details" });
      return;
    }

    const accountRegex =
      /Account #\d+:\s(0x[a-fA-F0-9]{40})\s+\(Private Key:\s(0x[a-fA-F0-9]{64})\)/g;

    const accounts = [];
    const privateKeys = [];
    let match;
    while ((match = accountRegex.exec(stdout)) !== null) {
      accounts.push(match[1]);
      privateKeys.push(match[2]);
    }

    res.status(200).json({
      accounts: accounts.slice(0, 12),
      privateKeys: privateKeys.slice(0, 12),
    });
  });
}
