const MelToken = artifacts.require("MelToken");
const MFPToken = artifacts.require("MFPToken");
const Gestor = artifacts.require("Gestor");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(MelToken);
    const melToken = await MelToken.deployed()

    await deployer.deploy(MFPToken);
    const mfpToken = await MFPToken.deployed()

    await deployer.deploy(Gestor, mfpToken.address, melToken.address);
    const gestor = await Gestor.deployed()

    await mfpToken.transfer(gestor.address, '1000000000000000000000000')
};
