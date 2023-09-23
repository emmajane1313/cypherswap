import getEnabledCurrencies from "../../graphql/queries/enabledCurrencies";

const availableCurrencies = async (): Promise<void> => {
  try {
    const response = await getEnabledCurrencies();
    if (response && response.data) {
      console.log(response.data.enabledModuleCurrencies);
    }
  } catch (err: any) {
    console.error(err.message);
  }
};

export default availableCurrencies;
