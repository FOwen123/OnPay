import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MetaTxForwarderModule = buildModule("MetaTxForwarderModule", (m) => {
    const metaTxForwarder = m.contract("MetaTxForwarder");

    return { metaTxForwarder };
})

export default MetaTxForwarderModule;