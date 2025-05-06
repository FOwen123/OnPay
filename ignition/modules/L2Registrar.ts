import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const L2RegistrarModule = buildModule("L2RegistrarModule", (m) => {
    const L2Registry = "0xeaB2F6cEe4c04F639C0A074EC2eE4994E46eAE42"; // L2Registry address on LiskSepolia

    const L2Registrar = m.contract("L2Registrar", [L2Registry]);

    return { L2Registrar };
});

export default L2RegistrarModule;