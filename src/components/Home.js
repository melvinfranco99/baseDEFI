import React, { Component } from 'react';
import Web3 from 'web3';
import MelToken from '../abis/MelToken.json'
import MFPToken from '../abis/MFPToken.json'
import Gestor from '../abis/Gestor.json'

import Navigation from './Navbar';

class App extends Component {

  async componentDidMount() {
    // 1. Carga de Web3
    await this.loadWeb3()
    // 2. Carga de datos de la Blockchain
    await this.loadBlockchainData()
  }

  // 1. Carga de Web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts: ', accounts)
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('¡Deberías considerar usar Metamask!')
    }
  }

  // 2. Carga de datos de la Blockchain
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Ganache -> 5777, Rinkeby -> 4, BSC -> 97
    const networkId = await web3.eth.net.getId()
    console.log('networkid:', networkId)

    const MELTokenData = MelToken.networks[networkId]
    if (MELTokenData) {
      const melToken = new web3.eth.Contract(MelToken.abi, MELTokenData.address)
      this.setState({ melToken: melToken })
      const balanceCuentaMel = await melToken.methods.balanceOf(this.state.account).call()
      this.setState({ balanceCuentaMel: balanceCuentaMel.toString() })
    } else {
      alert("El contrato MelToken no se ha desplegado correctamente")
    }

    const MFPTokenData = MFPToken.networks[networkId]
    if (MFPTokenData) {
      const mfpToken = new web3.eth.Contract(MFPToken.abi, MFPTokenData.address)
      this.setState({ mfpToken: mfpToken })
      const balanceCuentaMFP = await mfpToken.methods.balanceOf(this.state.account).call()
      this.setState({ balanceCuentaMFP: balanceCuentaMFP.toString() })
    } else {
      alert("El contrato MFPToken no se ha desplegado correctamente")
    }

    const GestorData = Gestor.networks[networkId]
    if (GestorData) {
      const gestor = new web3.eth.Contract(Gestor.abi, GestorData.address)
      this.setState({ gestor: gestor })
      let balanceStake = await gestor.methods.stakingBalance(this.state.account).call()
      this.setState({ stakeCuenta: balanceStake.toString() })
    } else {
      alert("El contrato Gestor no se ha desplegado correctamente")
    }

    //Cambiar a partir de aqui
    /*
    const networkData = smart_contract.networks[networkId]
    console.log('NetworkData:', networkData)

    if (networkData) {
      const abi = smart_contract.abi
      console.log('abi', abi)
      const address = networkData.address
      console.log('address:', address)
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
    } else {
      window.alert('¡El Smart Contract no se ha desplegado en la red!')
    }*/
  }

  async transfer(_direccion, _cantidad) {
    const melToken = this.state.melToken
    await melToken.methods.transfer(_direccion, _cantidad).send({ from: this.state.account })
  }

  async stake(_cantidad) {
    const melToken = this.state.melToken
    const gestor = this.state.gestor
    await melToken.methods.approve(this.state.gestor._address, _cantidad).send({ from: this.state.account })

    await gestor.methods.stakeTokens(_cantidad).send({ from: this.state.account })
  }

  async unstake() {
    const gestor = this.state.gestor
    await gestor.methods.unstakeTokens().send({ from: this.state.account })
  }

  async issueTokens() {
    if (this.state.account == '0xdef594d0a0e24ddb5869d3520aF0CAD4ba4dd9f8') {
      const gestor = this.state.gestor
      await gestor.methods.issueTokens().send({ from: this.state.account })
    } else {
      alert("No eres el propietario de este proyecto")
    }

  }



  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      loading: true,
      balanceCuentaMel: '0',
      melToken: {},
      mfpToken: {},
      gestor: {},
      stakeCuenta: 0,
      balanceCuentaMFP: '0'
    }
  }

  render() {
    return (
      <div>
        <Navigation account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto card">
                <h3>Datos de la cuenta</h3>
                <span>El balance de esta cuenta de MelTokens es: {this.state.balanceCuentaMel}</span>
                <span>El balance de esta cuenta de MFPTokens es: {this.state.balanceCuentaMFP}</span>
              </div>&nbsp;&nbsp;&nbsp;&nbsp;
              <div className="content mr-auto ml-auto card">
                <h2>Transferir MelTokens</h2>
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  let direccion = this.direccion.value
                  let cantidad = this.cantidad.value

                  await this.transfer(direccion, cantidad)

                }}>
                  <input
                    ref={(direccion) => { this.direccion = direccion }}
                    placeholder='0x0'
                    required
                  /><br></br><br></br>
                  <input
                    ref={(cantidad) => { this.cantidad = cantidad }}
                    placeholder='0'
                    required
                  /><br></br><br></br>
                  <button className='btn btn-primary' type='submit'>Transferir</button>
                </form>
              </div>&nbsp;&nbsp;&nbsp;&nbsp;
              <div className="content mr-auto ml-auto card">
                <h2>Stake</h2>
                <form onSubmit={async (e) => {
                  e.preventDefault()

                  let cantidad = this.cantidad.value

                  await this.stake(cantidad)
                }}>
                  <input
                    ref={(cantidad) => { this.cantidad = cantidad }}
                    placeholder='0'
                    required
                  /><br></br><br></br>
                  <button type='submit' className='btn btn-success'>Stake</button>
                </form>
                <br></br>
                <span>Tu balance de Staking actual es de: {this.state.stakeCuenta}</span>
              </div>&nbsp;&nbsp;&nbsp;&nbsp;
              <div className="content mr-auto ml-auto card"><br></br>
                <button onClick={async (e) => {
                  e.preventDefault()

                  await this.unstake()
                }} className='btn btn-danger'>Unstake Tokens</button>
              </div>&nbsp;&nbsp;&nbsp;&nbsp;
              <div className="content mr-auto ml-auto card"><br></br>
                <button onClick={async (e) => {
                  await this.issueTokens()
                }} className='btn btn-success'>Issue Tokens Only Owner</button>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
