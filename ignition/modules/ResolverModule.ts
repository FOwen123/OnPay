import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ResolverModule = buildModule("ResolverModule", (m) => {
    const resolver = m.contract("Resolver");

    return { resolver };
});

export default ResolverModule;