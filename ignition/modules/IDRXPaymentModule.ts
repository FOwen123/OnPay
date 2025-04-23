import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const IDRXPaymentModule = buildModule("IDRXPaymentModule", (m) =>{
    const IdrxTokenSepolia = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661"; // IDRX token address on Sepolia
    
    const idrxPayment = m.contract("IDRXPayment", [IdrxTokenSepolia]);

    return { idrxPayment };
});

export default IDRXPaymentModule;