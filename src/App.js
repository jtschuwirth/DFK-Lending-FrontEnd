import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import HeroLending from "./Components/HeroLending";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

const ethereum = window.ethereum;
const Web3 = require('web3');
const web3 = new Web3(ethereum);
var BN = web3.utils.BN;

var TreeJson = require("./build/contracts/Tree.json");
var TreeABI = TreeJson["abi"];
var TreeAddress = TreeJson["networks"]["2"]["address"];
var TreeContract = new web3.eth.Contract(TreeABI, TreeAddress);

var TokenJson = require("./build/contracts/PTG.json");
var TokenABI = TokenJson["abi"];
var TokenAddress = TokenJson["networks"]["2"]["address"];
var TokenContract = new web3.eth.Contract(TokenABI, TokenAddress);

var HeroLendingJson = require("./build/contracts/HeroLending.json");
var HeroLendingABI = HeroLendingJson["abi"];
var HeroLendingAddress = HeroLendingJson["networks"]["2"]["address"];
var HeroLendingContract = new web3.eth.Contract(HeroLendingABI, HeroLendingAddress);

function App() {
    const [Address, setAddress] = useState(null);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [currentChain, setCurrentChain] = useState(null);
    const [OwnedHeros, setOwnedHeros] = useState([]);
    const [showToast, setShowToast] = useState(false);

    const ShowPending = () => setShowToast(true);
    const ClosePending = () => setShowToast(false);

    useEffect(() => {
        ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
            setCurrentChain(chainId);
        });
        ethereum.on('chainChanged', (_chainId) => window.location.reload());
        ethereum.on('accountsChanged', () => window.location.reload());
        // eslint-disable-next-line
    },[Address]);

    async function mintNFT() {
        let value = await requestCurrentPrice()
        TreeContract.methods.createNewTree().send({from: Address, value: value}).on("transactionHash", function(hash) {
            ShowPending()
        }).on("receipt", function(receipt) {
            ClosePending()
            requestHeros();
        });
    }

    async function mintToken() {
        let exp = new BN(10, 10).pow(new BN(18, 10));
        let value = new BN(1000).mul(exp);
        TokenContract.methods.mint(Address, value).send({from: Address}).on("transactionHash", function(hash) {
            ShowPending()
        }).on("receipt", function(receipt) {
            ClosePending()
        });
    }

    async function requestCurrentPrice() {
        let currentPrice;
        try {
            currentPrice = await TreeContract.methods.currentPrice().call()
        } catch (error) {
            console.error(error);
        }
        return currentPrice
    }

    async function requestBalance(address) {
        let balance;
        try {
            balance = await TokenContract.methods.balanceOf(address).call()
        } catch (error) {
            console.error(error);
        }
        setCurrentBalance(balance/(10**18));
    }

    async function requestHeros() {
        let ownedHeros = [];
        let herosQuantity = await TreeContract.methods.treesQuantity().call()
        for (let i=0; i<herosQuantity; i++) {
            let owner = await TreeContract.methods.ownerOf(i).call()
            if (owner.toLowerCase() == Address) {
                ownedHeros.push(i)
            }
        }
        setOwnedHeros(ownedHeros);
    }

    if (currentChain === "0x6357d2e0") {
        return(
        <div >
            <style type="text/css">
                {`
                .accordion-item {
                    border: 1px solid green;
                }
                `}
                </style>
            <Header 
                Address={Address}
                setAddress={setAddress}
                currentBalance={currentBalance}
                mintNFT={mintNFT}
                mintToken={mintToken}
                requestBalance={requestBalance}

                TokenContract={TokenContract}
                HeroLendingAddress={HeroLendingAddress}

                showToast={showToast}
                ShowPending={ShowPending}
                ClosePending={ClosePending}
            />
            <HeroLending 
                Address={Address}
                currentBalance={currentBalance}
                OwnedHeros={OwnedHeros}
                requestHeros={requestHeros}

                TokenContract={TokenContract}
                TreeContract={TreeContract}
                HeroLendingContract={HeroLendingContract}
                HeroLendingAddress={HeroLendingAddress}

                ShowPending={ShowPending}
                ClosePending={ClosePending}
            />
        </div>
        )
    } else {
        return (
            <Container>
            <Row style={{height: "80px"}}></Row>
            <Row>
                <h1 className="d-flex justify-content-center">Connect to the Harmony Testnet</h1>
            </Row>
            </Container>
        )
    }
}

export default App;