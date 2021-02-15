var Web3 = require('web3');
//const artifactMortgage = require('../../build/contracts/Mortgage.json');
var constants = require('../lib/constants');
var accounts, ownerAccount, bankAccount, insurerAccount, irsAccount;
var defaultGas = 4700000;
var loanContractAddress;
var Mortgage;
var loanInstance;
var txHashMH;
var txHashIns;
var txHashIrs;
var childKycWindow;
var timer;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
const deploy = async () => {

    console.log('Attempting to deploy from account: ', ownerAccount);
    const abi= JSON.parse('[{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_owner","type":"address"}],"name":"LienReleased","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_owner","type":"address"}],"name":"LienTrasferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_status","type":"int256"}],"name":"LoanStatus","type":"event"},{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"deposit","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"receiver","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"checkMortgagePayoff","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_addressOfProperty","type":"bytes32"},{"name":"_purchasePrice","type":"uint32"},{"name":"_term","type":"uint32"},{"name":"_interest","type":"uint32"},{"name":"_loanAmount","type":"uint32"},{"name":"_annualTax","type":"uint32"},{"name":"_annualInsurance","type":"uint32"},{"name":"_monthlyPi","type":"uint32"},{"name":"_monthlyTax","type":"uint32"},{"name":"_monthlyInsurance","type":"uint32"},{"name":"_mortgageHolder","type":"address"},{"name":"_insurer","type":"address"},{"name":"_irs","type":"address"}],"name":"submitLoan","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getLoanData","outputs":[{"name":"_addressOfProperty","type":"bytes32"},{"name":"_purchasePrice","type":"uint32"},{"name":"_term","type":"uint32"},{"name":"_interest","type":"uint32"},{"name":"_loanAmount","type":"uint32"},{"name":"_annualTax","type":"uint32"},{"name":"_annualInsurance","type":"uint32"},{"name":"_status","type":"int256"},{"name":"_monthlyPi","type":"uint32"},{"name":"_monthlyTax","type":"uint32"},{"name":"_monthlyInsurance","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_status","type":"int256"}],"name":"approveRejectLoan","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]');
    const bytecode = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060006001600701819055506305f5e100601060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610da2806100b36000396000f300608060405260043610610083576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806327e235e31461008857806347e7ef24146100df5780635cc8e54e146101405780639384070814610157578063a3f14e9614610184578063f14b7e0c14610269578063f8b2cb4f1461038a575b600080fd5b34801561009457600080fd5b506100c9600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506103e1565b6040518082815260200191505060405180910390f35b3480156100eb57600080fd5b5061012a600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506103f9565b6040518082815260200191505060405180910390f35b34801561014c57600080fd5b50610155610532565b005b34801561016357600080fd5b506101826004803603810190808035906020019092919050505061082a565b005b34801561019057600080fd5b506101996109af565b604051808c600019166000191681526020018b63ffffffff1663ffffffff1681526020018a63ffffffff1663ffffffff1681526020018963ffffffff1663ffffffff1681526020018863ffffffff1663ffffffff1681526020018763ffffffff1663ffffffff1681526020018663ffffffff1663ffffffff1681526020018581526020018463ffffffff1663ffffffff1681526020018363ffffffff1663ffffffff1681526020018263ffffffff1663ffffffff1681526020019b50505050505050505050505060405180910390f35b34801561027557600080fd5b506103886004803603810190808035600019169060200190929190803563ffffffff169060200190929190803563ffffffff169060200190929190803563ffffffff169060200190929190803563ffffffff169060200190929190803563ffffffff169060200190929190803563ffffffff169060200190929190803563ffffffff169060200190929190803563ffffffff169060200190929190803563ffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610ad1565b005b34801561039657600080fd5b506103cb600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610d2d565b6040518082815260200191505060405180910390f35b60106020528060005260406000206000915090505481565b600081601060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156104475761052c565b81601060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555081601060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055506104e9610532565b601060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490505b92915050565b600160000160000160009054906101000a900463ffffffff16600c600160030160000160009054906101000a900463ffffffff16020263ffffffff1660106000600160040160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541480156106845750600160000160000160009054906101000a900463ffffffff16600c600160030160000160049054906101000a900463ffffffff16020263ffffffff1660106000600160040160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054145b80156107315750600160000160000160009054906101000a900463ffffffff16600c600160030160000160089054906101000a900463ffffffff16020263ffffffff1660106000600160040160020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054145b15610828576000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff166001800160010160046101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f54baa8a225591732bfb03c9611a550b0662f3668a2e316cf99467ec5efe1ddb06001800160010160049054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a15b565b600160040160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561088c57600080fd5b80600160070181905550600281141561097057336001800160010160046101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507ff5b202ad34aad00c0fabc445b20216181da94cc429e2e8f1204a7abdabea00916001800160010160049054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a15b7f9199c2204168edea815389607e935fbabac15bd002ff8a7db78fe8056075afb16001600701546040518082815260200191505060405180910390a150565b600080600080600080600080600080600060018001600001549a506001800160010160009054906101000a900463ffffffff169950600160000160000160009054906101000a900463ffffffff169850600160000160000160049054906101000a900463ffffffff169750600160000160000160089054906101000a900463ffffffff1696506001600001600001600c9054906101000a900463ffffffff169550600160000160000160109054906101000a900463ffffffff169450600160030160000160009054906101000a900463ffffffff169250600160030160000160049054906101000a900463ffffffff169150600160030160000160089054906101000a900463ffffffff1690506001600701549350909192939495969798999a565b8c6001800160000181600019169055508b6001800160010160006101000a81548163ffffffff021916908363ffffffff1602179055508a600160000160000160006101000a81548163ffffffff021916908363ffffffff16021790555089600160000160000160046101000a81548163ffffffff021916908363ffffffff16021790555088600160000160000160086101000a81548163ffffffff021916908363ffffffff160217905550876001600001600001600c6101000a81548163ffffffff021916908363ffffffff16021790555086600160000160000160106101000a81548163ffffffff021916908363ffffffff16021790555085600160030160000160006101000a81548163ffffffff021916908363ffffffff16021790555084600160030160000160046101000a81548163ffffffff021916908363ffffffff16021790555083600160030160000160086101000a81548163ffffffff021916908363ffffffff16021790555082600160040160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600160040160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160040160020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506001806007018190555050505050505050505050505050565b6000601060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490509190505600a165627a7a72305820a346d6a2df014a19dac4abff3bd7bd2fdf78857cb36ea4234329458f6c85f4c00029";
   
   
    web3 = new Web3(web3.currentProvider);
    console.log(web3.version);
    loanInstance = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode })
    .send({ transactionConfirmationBlocks: '1', gas: defaultGas, from: ownerAccount});
    //var txHash = deployResult.transactionHash;
   
    /*
    // wait until the contract is mined
    var receipt;

    // Wait for the transaction to be mined
    while (receipt == null) {

        receipt = web3.eth.getTransactionReceipt(txHash);  

        // Simulate the sleep function
        sleep('15000');
    }
*/
    // get contract address
    var contractAddress = loanInstance.options.address;
    //This will display the address to which your contract was deployed
    console.log('Contract deployed to: ', contractAddress);
    loanContractAddress = contractAddress;
    return loanInstance;
};

window.deployLoanContract = function () {
    workingStatus();
     deploy().then(
        function(loanInstance) {
           
            loanContractAddress = loanInstance.options.address;
            $('#sectionAAddress').html('<i class="fa fa-address-card"></i> ' +
                '<a  target="#" onclick="getLoanData(' + loanContractAddress + ');return false;" href="' + loanContractAddress +
                ' ">' + loanContractAddress + '</a>');
            $('#sectionBAddress').html('<i class="fa fa-address-card"></i> ' +
                '<a  target="#" onclick="getLoanData(' + loanContractAddress + ');return false;" href="' + loanContractAddress +
                ' ">' + loanContractAddress + '</a>');
            $('#sectionCAddress').html('<i class="fa fa-address-card"></i> ' +
                '<a  target="#" onclick="getLoanData(' + loanContractAddress + ');return false;" href="' + loanContractAddress +
                ' ">' + loanContractAddress + '</a>');
            $('#sectionDAddress').html('<i class="fa fa-address-card"></i> ' +
                '<a  target="#" onclick="getLoanData(' + loanContractAddress + ');return false;" href="' + loanContractAddress +
                ' ">' + loanContractAddress + '</a>');
        }).then(function() {
        getStatus();
    }).then(function() {
        //var ct = Mortgage.at(loanContractAddress);
        web3.eth.getBalance(ownerAccount).then(function(data) {
            $('#ownerBalance').html(web3.utils.fromWei(data));
        });
    });
}

function getStatus() {
    loanInstance.methods.getLoanData().call({from: ownerAccount}).then(function(data) {
        if (data[7] == 0) {
            $('#sectionAStatus').html('Initiated');
            $('#sectionBStatus').html('Initiated');
            $('#sectionCStatus').html('Initiated');
            $('#sectionDStatus').html('Initiated');
        } else if (data[7] == 1) {
            $('#sectionAStatus').html('Submitted');
            $('#sectionBStatus').html('Submitted');
            $('#sectionCStatus').html('Submitted');
            $('#sectionDStatus').html('Submitted');
        } else if (data[7] == 2) {
            $('#sectionAStatus').html('Approved');
            $('#sectionBStatus').html('Approved');
            $('#sectionCStatus').html('Approved');
            $('#sectionDStatus').html('Approved');
        } else if (data[7] == 3) {
            $('#sectionAStatus').html('Rejected');
            $('#sectionBStatus').html('Rejected');
            $('#sectionCStatus').html('Rejected');
            $('#sectionDStatus').html('Rejected');
        }

   }
    );
}
window.submitKyc = function () {
    $('#sectionKStatus').html('Initiated');
    $('#sectionLStatus').html('Initiated');
    childKycWindow = window.open(constants.KYC_SERVICE,'KYC SUBMISSION','menubar=no,top=150,left=150,width=1200,height=600');
    timer = setInterval(checkChild, 500);
    $('#sectionKStatus').html('Completed');
    $('#sectionLStatus').html('Completed');
}

function checkChild() {
    if (childKycWindow.closed) {
        clearInterval(timer);
    }
}

function workingStatus() {
    $('#sectionAStatus').html('<div class="spin-c"><i class="fa fa-spinner fa-spin"></i></div>');
    $('#sectionBStatus').html('<div class="spin-c"><i class="fa fa-spinner fa-spin"></i></div>');
    $('#sectionCStatus').html('<div class="spin-c"><i class="fa fa-spinner fa-spin"></i></div>');
    $('#sectionDStatus').html('<div class="spin-c"><i class="fa fa-spinner fa-spin"></i></div>');
   
}

function workingPaymentStatus(address) {
    if (address == bankAccount) {
        $('#payReciptMH').html('<div><i class="fa fa-spinner fa-spin"></i></div>');
    } else if (address == insurerAccount) {
        $('#payReciptIns').html('<div><i class="fa fa-spinner fa-spin"></i></div>');
    } else if (address == irsAccount) {
        $('#payReciptIrs').html('<div><i class="fa fa-spinner fa-spin"></i></div>');  
    } 
}

function submitLoan() {
    var ct = loanInstance;
    var _addressOfProperty = $("#propertyAddress").val();
    var _purchasePrice = $("#purchasePrice").val() * 100;
    var _term = $("#YR").val() * 100;
    var _interest = $("#IR").val() * 100;
    var _loanAmount = $("#LA").val() * 100;
    var _annualTax = $("#AT").val() * 100;
    var _annualInsurance = $("#AI").val() * 100;
    var _monthlyPi = $("#PI").val() * 100;
    var _monthlyTax = $("#MT").val() * 100;
    var _monthlyInsurance = $("#MI").val() * 100;
    workingStatus();
    ct.methods.submitLoan(web3.utils.toHex(_addressOfProperty),
        _purchasePrice,
        _term,
        _interest,
        _loanAmount,
        _annualTax,
        _annualInsurance,
        _monthlyPi,
        _monthlyTax,
        _monthlyInsurance,
        bankAccount, 
        insurerAccount, 
        irsAccount).send({ from: ownerAccount, gas: defaultGas }
    ).then(function(txHash) {
        getStatus();
    }).then(function() {
        ct.methods.getLoanData().call({ from: ownerAccount }).then(function(data) {
            $('#totalBankBalance').html((data[8] / 100) * 12 * 30);
            $('#bankBalance').html('0');
            $('#outstandingBankBalance').html((data[8] / 100) * 12 * 30);

            $('#totalInsurerBalance').html((data[9] / 100) * 12 * 30);
            $('#insurerBalance').html('0');
            $('#outstandingInsurerBalance').html((data[9] / 100) * 12 * 30);

            $('#totalIrsBalance').html((data[10] / 100) * 12 * 30);
            $('#irsBalance').html('0');
            $('#outstandingIrsBalance').html((data[10] / 100) * 12 * 30);
        });
    }).catch(function(e) {
        console.log("catching---->" + e)
        if ((e + "").indexOf("invalid JUMP") || (e + "").indexOf("out of gas") > -1) {
            // We are in TestRPC
        } else if ((e + "").indexOf("please check your gas amount") > -1) {
            // We are in Geth for a deployment
        } else {
            throw e;
        }
    });
}

function approveLoan() {
    workingStatus();
    loanInstance.methods.approveRejectLoan(2).send({ from: bankAccount, gas: defaultGas }).then(function(txHash) {
        getStatus();
    });
}

function rejectLoan() {
    workingStatus();
    loanInstance.methods.approveRejectLoan(3).send({ from: bankAccount, gas: defaultGas }).then(function(txHash) {
        getStatus();
    });
}

window.getLoanData = function () {
    loanInstance.methods.getLoanData().call().then(function(data) {
        $('#propAddr').html(hex2string(data[0]));
        $('#purPrice').html(data[1] / 100);
        $('#termYrs').html(data[2] / 100);
        $('#intr').html(data[3] / 100);
        $('#loanAmt').html(data[4] / 100);
        $('#annTax').html(data[5] / 100);
        $('#annIns').html(data[6] / 100);

        $('#modalLoanDetails').modal({
            keyboard: true,
            backdrop: "static"
        });

    });
}

window.getReceiptData = function (address, value) {
       var txHash; 
    if (address == bankAccount) {
        txHash = txHashMH;
    } else if (address == insurerAccount) {
        txHash = txHashIns;
    } else if (address == irsAccount) {
        txHash = txHashIrs;
    }
        $('#paidValue').html(value / 100);
        $('#fromAddr').html(ownerAccount);
        $('#toAddr').html(txHash['to']);
        $('#txId').html(txHash['transactionHash']);
        $('#gasFee').html(txHash['gasUsed']);

        $('#modalPaymentReceipt').modal({
            keyboard: true,
            backdrop: "static"
        });
}

function getMonthlyPayment() {
    loanInstance.methods.getLoanData().call().then(function(data) {
        $('#valueMH').val(data[8] / 100);
        $('#valueIssurer').val(data[9] / 100);
        $('#valueIRS').val(data[10] / 100);
    });

}

function completePayment() {
    completeBank();
    completeInsurer();
    completeIrs();

}

function completeBank() {
    var bankBal;
    loanInstance.methods.getBalance(bankAccount).call().then(function(data) {
        bankBal = data / 100;
    }).then(function() {
        loanInstance.methods.getLoanData().call().then(function(data) {
            $('#valueMH').val(((data[8] / 100) * 12 * 30) - bankBal);
        });

    });
}

function completeInsurer() {
    var insBal;
    loanInstance.methods.getBalance(insurerAccount).call().then(function(data) {
        insBal = data / 100;
    }).then(function() {
        loanInstance.methods.getLoanData().call().then(function(data) {
            $('#valueIssurer').val(((data[9] / 100) * 12 * 30) - insBal);
        });

    });
}

function completeIrs() {
    var irsBal;
    loanInstance.methods.getBalance(irsAccount).call().then(function(data) {
        irsBal = data / 100;
    }).then(function() {
        loanInstance.methods.getLoanData().call().then(function(data) {
            $('#valueIRS').val(((data[10] / 100) * 12 * 30) - irsBal);
        });

    });
}

window.makePayment = function(value, address) {
    var bankBal, insBal, irsBal;
    workingPaymentStatus(address);
    loanInstance.methods.deposit(address,
        value * 100).send({ from: ownerAccount, gas: defaultGas }
    ).then(function(txHash) {
        console.log(txHash);
        value1 = value * 100;
        if (address == bankAccount) {
            txHashMH = txHash;
            $('#payReciptMH').html('<button id="viewReceipt" class="btn btn-primary btn-receipt"' +
            'onClick="getReceiptData(' + address + ', ' + value1 + ')">Receipt</button>');
        } else if (address == insurerAccount) {
            txHashIns = txHash;
            $('#payReciptIns').html('<button id="viewReceipt" class="btn btn-primary btn-receipt"' +
            'onClick="getReceiptData(' + address+ ', ' + value1 + ')">Receipt</button>');
        } else if (address == irsAccount) {
            txHashIrs = txHash;
            $('#payReciptIrs').html('<button id="viewReceipt" class="btn btn-primary btn-receipt"' +
            'onClick="getReceiptData(' + address + ', ' + value1 + ')">Receipt</button>');
        }
    }).then(function() {
        loanInstance.methods.getBalance(ownerAccount).call().then(function(data) {
            $('#ownerBalance').html(data / 100);
        });
    }).then(function() {
        loanInstance.methods.getBalance(address).call().then(function(data) {
            if (address == bankAccount) {
                $('#bankBalance').html(data / 100);
                bankBal = data / 100;
            } else if (address == insurerAccount) {
                $('#insurerBalance').html(data / 100);
                insBal = data / 100;
            } else if (address == irsAccount) {
                $('#irsBalance').html(data / 100);
                irsBal = data / 100;
            }
        });
    }).then(function() {
        loanInstance.methods.getLoanData().call().then(function(data) {
            if (address == bankAccount) {
                $('#outstandingBankBalance').html(((data[8] / 100) * 12 * 30) - bankBal);
            } else if (address == insurerAccount) {
                $('#outstandingInsurerBalance').html(((data[9] / 100) * 12 * 30) - insBal);
            } else if (address == irsAccount) {
                $('#outstandingIrsBalance').html(((data[10] / 100) * 12 * 30) - irsBal);
            }
        });
    });
}

function getBalance(address) {
    loanInstance.methods.getBalance(address).call().then(function(data) {
        return data / 100;
    });
}

function hex2string(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        var v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
}

window.truncateToDecimals = function (obj) {
    var num = obj.value;
    const calcDec = Math.pow(10, 2);
    obj.value = Math.trunc(num * calcDec) / calcDec;
}

function floor(number) {
    return Math.floor(number * Math.pow(10, 2) + 0.9) / Math.pow(10, 2);
}


window.dosum = function () {
    var mi = $("#IR").val() / 1200;
    var base = 1;
    var mbase = 1 + mi;
    var i =0;
    for (i = 0; i < $("#YR").val() * 12; i++) {
        base = base * mbase
    }

    $("#PI").val(floor($("#LA").val() * mi / (1 - (1 / base))));
    $("#MT").val(floor($("#AT").val() / 12));
    $("#MI").val(floor($("#AI").val() / 12));
    var dasum = $("#LA").val() * mi / (1 - (1 / base)) +
        $("#AT").val() / 12 + $("#AI").val() / 12;
    $("#MP").val(floor(dasum));
}

window.onload = async () =>  {
   /* web3 = new Web3(
        new Web3.providers.HttpProvider("https://mrg-21480-test.morpheuslabs.io"),
      );
    Mortgage = new web3.eth.Contract(artifactMortgage.abi);
    */

    const web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
            alert("There was an error fetching your accounts.");
            return;
        }
        if (accs.length == 0) {
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
            return;
        }
        accounts = accs;
        ownerAccount = accounts[0];
        bankAccount = constants.BANK_ACCOUNT;
        insurerAccount = constants.INSURER_ACCOUNT;
        irsAccount = constants.IRS_ACCOUNT;
        $('#ownerAccount').html(ownerAccount);
        $('#bankAccount').html(bankAccount);
        $('#insurerAccount').html(insurerAccount);
        $('#irsAccount').html(irsAccount);

        $('#payMHaddress').val(bankAccount);
        $('#payIssureraddress').val(insurerAccount);
        $('#payIRSaddress').val(irsAccount);
    });

    $("#deployLoanContract").click(function() {
        deployLoanContract();
    });

    $("#submitLoan").click(function() {
        submitLoan();
    });

    $("#approveLoan").click(function() {
        approveLoan();
    });
    $("#rejectLoan").click(function() {
        rejectLoan();
    });
    $("#getMonthlyPayment").click(function() {
        getMonthlyPayment();
    });

    $("#completePayment").click(function() {
        completePayment();
    });

    $("#modalClose").click(function() {
        $('#modalLoanDetails').modal('hide');
    });
    $("#modalCloseReceipt").click(function() {
        $('#modalPaymentReceipt').modal('hide');
    }); 
};