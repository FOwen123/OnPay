import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const L1ResolverModule = buildModule("L1ResolverModule", (m) => {
    const deployer = m.getAccount(0);

    const url = "https://ens-gateway.onpaylisk.workers.dev/v1/{sender}/{data}";
    const signer = deployer;
    const owner = deployer;

    const L1Resolver = m.contract("L1Resolver", [url, signer, owner]);

    return { L1Resolver };
});

export default L1ResolverModule;