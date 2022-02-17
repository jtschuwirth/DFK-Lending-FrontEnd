import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import HeroLending from "./Components/HeroLending";

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
    const [currentBalance, setCurrentBalance] = useState(null);
    const [showToast, setShowToast] = useState(false);

    const ShowPending = () => setShowToast(true);
    const ClosePending = () => setShowToast(false);

    async function mintNFT() {
        let value = await requestCurrentPrice()
        TreeContract.methods.createNewTree().send({from: Address, value: value}).on("transactionHash", function(hash) {
            ShowPending()
        }).on("receipt", function(receipt) {
            ClosePending()
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

    return(
        <div>
            <Header 
                Address={Address}
                setAddress={setAddress}
                currentBalance={currentBalance}
                mintNFT={mintNFT}
                mintToken={mintToken}

                requestBalance={requestBalance}

                showToast={showToast}
                ShowPending={ShowPending}
                ClosePending={ClosePending}
            />
            <HeroLending 
                Address={Address}
                currentBalance={currentBalance}

                TokenContract={TokenContract}
                TreeContract={TreeContract}
                HeroLendingContract={HeroLendingContract}
                HeroLendingAddress={HeroLendingAddress}

                ShowPending={ShowPending}
                ClosePending={ClosePending}
            />
        </div>
    )
}

export default App;