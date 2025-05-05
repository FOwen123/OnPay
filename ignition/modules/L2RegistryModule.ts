import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const L2RegistryModule = buildModule("L2RegistryModule", (m) => {
    const tokenName = "lisk.eth";
    const tokenSymbol = "LISK";

    const L2Registry = m.contract("L2Registry", [tokenName, tokenSymbol]);

    return { L2Registry };
});

export default L2RegistryModule;