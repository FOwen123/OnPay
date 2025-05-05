import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const L2ResolverModule = buildModule("L2ResolverModule", (m) => {
    const L2Resolver = m.contract("L2Resolver");

    return { L2Resolver };
});

export default L2ResolverModule;