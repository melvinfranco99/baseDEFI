// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// A Owner: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
// B Usuario: 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
// C Amigo al que le permito enviar 50: 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
// D Amigo que recibe 20: 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB
//Envio 20 de C a D
// 0x617F2E2fD72FD9D5503197092aC168c91465E7f2
// 0x17F6AD8Ef982297579C203069C1DbfFE4348c372

import "./MelToken.sol";
import "./MFPToken.sol";

contract Gestor {
    // Declaraciones iniciales
    string public name = "Gestor";
    address public owner;
    MelToken public melToken;
    MFPToken public mfpToken;

    // Estructuras de datos
    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    // Constructor
    constructor(MFPToken _mfpToken, MelToken _melToken) {
        mfpToken = _mfpToken;
        melToken = _melToken;
        owner = msg.sender;
    }

    // Stake de tokens
    function stakeTokens(uint _amount) public {
        // Se require una cantidad superior a 0
        require(_amount > 0, "La cantidad no puede ser menor a 0");
        // Transferir tokens JAM al Smart Contract principal
        melToken.transferFrom(msg.sender, address(this), _amount);
        // Actualizar el saldo del staking
        stakingBalance[msg.sender] += _amount;
        // Guardar el staker
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        // Actualizar el estado del staking
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Quitar el staking de los tokens
    function unstakeTokens() public {
        // Saldo del staking de un usuario
        uint balance = stakingBalance[msg.sender];
        // Se require una cantidad superior a 0
        require(balance > 0, "El balance del staking es 0");
        // Transferencia de los tokens al usuario
        melToken.transfer(msg.sender, balance);
        // Resetea el balance de staking del usuario
        stakingBalance[msg.sender] = 0;
        // Actualizar el estado del staking
        isStaking[msg.sender] = false;
    }

    // Emision de Tokens (recompensas)
    function issueTokens() public {
        // Unicamente ejecutable por el owner
        require(msg.sender == owner, "No eres el owner");
        // Emitir tokens a todos los stakers
        for (uint i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if (balance > 0) {
                mfpToken.transfer(recipient, balance);
            }
        }
    }
}
