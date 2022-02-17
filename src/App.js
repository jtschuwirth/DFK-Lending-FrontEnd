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
        TokenContract.methods.mint().send({from: Address, value: value}).on("transactionHash", function(hash) {
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

    return(
        <div>
            <Header 
                Address={Address}
                setAddress={setAddress}
                currentBalance={currentBalance}
                mintNft={mintNFT}
                mintToken={mintToken}

                showToast={showToast}
                ShowPending={ShowPending}
                ClosePending={ClosePending}
            />
            <HeroLending 
                Address={Address}
                currentBalance={currentBalance}
            />
        </div>
    )
}

export default App;