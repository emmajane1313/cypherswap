import approvedModuleAllowance from "../../graphql/queries/approvedAllowance";
import approvedData from "../../graphql/queries/approvedData";

const checkApproved = async (
  currencyAddress: string,
  collectModule: string | null,
  value: string
): Promise<any | void> => {
  try {
    const response = await approvedModuleAllowance({
      currencies: [currencyAddress],
      collectModules: [collectModule],
      followModules: [],
      referenceModules: [],
    });
    console.log({ response: response.data.approvedModuleAllowanceAmount[0] });
    const approvalArgs = await approvedData({
      currency: currencyAddress,
      value: value,
      collectModule: collectModule,
    });
    console.log({ approvalArgs });
    return {
      approvalArgs: approvalArgs?.data?.generateModuleCurrencyApprovalData,
      contractAddress: response.data.approvedModuleAllowanceAmount[0].contractAddress,
    };
  } catch (err: any) {
    console.error(err.message);
  }
};

export default checkApproved;
