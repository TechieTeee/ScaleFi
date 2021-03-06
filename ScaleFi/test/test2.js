/**
* MIT License
*
* Copyright (c) 2019 ScaleFi
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
var ScaleFi = artifacts.require("./ScaleFi.sol");
var ScaleFiLoan = artifacts.require("./ScaleFiLoan.sol");
var StandardToken = artifacts.require("./StandardToken.sol");
const {helper, provider} = require("./truffleTestHelpers");
const web3 = provider();

contract("Test 2", function(accounts) {

  var admin = accounts[0];
  var borrower = accounts[1];
  var lender = accounts[2];

  var loanRequest = {
    loanAmount: web3.utils.toWei('0.02', 'ether'),
    duration: 120,
    interest: 50,
    collateralAddress: "0",
    collateralAmount: 20000,
    collateralPrice: web3.utils.toWei('0.001', 'ether'),
    borrower: borrower,
    lender: lender,
    loanContractAddress: "0",
    outstandingAmount: "0.02045",
    repayments: ["0.0052625", "0.0050625", "0.0050625", "0.0050625"]
  };

  describe("Scenario 1: All repayments paid", () => {

    var ScaleFi, standardToken, loanContractAddress;

    before('Initialize and Deploy SmartContracts', async () => {

      ScaleFi = await ScaleFi.new();
      standardToken = await StandardToken.new("Test Tokens", "TTT", 18, 10000000);

      await standardToken.transfer(borrower, 1000000, {
        from: admin,
        gas: 300000
      });

      loanRequest.collateralAddress = standardToken.address;
    });

    it('should create new loan request and return loan contract address', async() => {

      var receipt = await ScaleFi.createNewLoanRequest(loanRequest.loanAmount, loanRequest.duration,
        loanRequest.interest, loanRequest.collateralAddress, loanRequest.collateralAmount, loanRequest.collateralPrice, {
        from: loanRequest.borrower,
        gas: 3000000
      });

      loanRequest.loanContractAddress = receipt.logs[0].args[1];

      assert.notEqual(loanRequest.loanContractAddress, 0x0, "Loan Contract wasnt created correctly");

    });

    it('should return all loans', async() => {

      var loans = await ScaleFi.getAllLoans.call();

      assert.notEqual(loans.length, 0, "Loans not returned correctly");

    });

    it('should get loan data from loan contract', async() => {

      var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);
      var loan = await ScaleFiLoan.getLoanData.call();

      assert.notEqual(loan, undefined, "Loan Data not correct");

    });

    it('should transfer collateral to loanContract', async() => {

      await standardToken.approve(loanRequest.loanContractAddress, loanRequest.collateralAmount, {
        from: loanRequest.borrower,
        gas: 300000
      });

      var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);

      await ScaleFiLoan.transferCollateralToLoan({
        from: loanRequest.borrower,
        gas: 300000
      });

      var loan = await ScaleFiLoan.getLoanData.call();

      assert.equal(loan[4], 1, "Loan Contract status in not ACTIVE");
      assert.equal(loan[8], 1, "Loan Collateral status is not ARRIVED");

    });

    it('should approve loan request and transfer funds to borrower', async() => {

      var borrower_previous_balance = await await web3.eth.getBalance(loanRequest.borrower);

      var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);

      await ScaleFiLoan.approveLoanRequest({
        from: loanRequest.lender,
        value: loanRequest.loanAmount,
        gas: 300000
      });

      var loan = await ScaleFiLoan.getLoanData.call();

      assert.equal(loan[4], 2, "Loan Contract status is not FUNDED");
      assert.equal(await web3.eth.getBalance(loanRequest.borrower),
        parseInt(borrower_previous_balance) + parseInt(loanRequest.loanAmount),
        "Correct amount not transferred to BORROWER");
      assert.equal(loan[12], loanRequest.lender, "Correct lender address not set");
    });

    it("should get correct repayment amounts", async() => {

      var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);

      let count = 0;
      loanRequest.repayments.forEach(async function(repayment){
          ++count;
          var r = await ScaleFiLoan.getRepaymentAmount.call(count);

          assert.equal(parseInt(r.amount), web3.utils.toWei(repayment, 'ether'), "Repayment " + count + " is not correct");
      });

    });


    it("should be able to repay the first loan repayment and transfer fee to platform", async() => {

      var lender_previous_balance = await web3.eth.getBalance(loanRequest.lender);
      //var platform_previous_balance = await web3.eth.getBalance(loanRequest.lender);
      var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);

      var r1 = await ScaleFiLoan.getRepaymentAmount.call(1);

      await ScaleFiLoan.repayLoan({
        from: loanRequest.borrower,
        value: parseInt(r1.amount),
        gas: 300000
      });

      var loan = await ScaleFiLoan.getLoanData.call();

      assert.equal(parseInt(loan[9]), parseInt(web3.utils.toWei(loanRequest.outstandingAmount, 'ether')) - parseInt(r1.amount), "Outstanding Amount for repayment number 1 is not correct");
      assert.equal(await web3.eth.getBalance(loanRequest.lender),
        parseInt(lender_previous_balance) + parseInt(r1.amount) - parseInt(r1.fees),
        "Correct amount not transferred to Lender");
    });

    it("should be able to repay the remaining loan repayment", async() => {

      var lender_previous_balance = await await web3.eth.getBalance(loanRequest.lender);

      var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);

      for(let i=1; i< loanRequest.repayments.length; i++){

          await advanceTime(1980);

          var r = await ScaleFiLoan.getRepaymentAmount.call(i+1);

          await ScaleFiLoan.repayLoan({
            from: loanRequest.borrower,
            value: parseInt(r.amount),
            gas: 300000
          });

      };

      var loan = await ScaleFiLoan.getLoanData.call();

      assert.equal(parseInt(loan[9]), 0, "Outstanding Amount after all repayments is not correct");
      // assert.equal(await web3.eth.getBalance(loanRequest.lender),
      //   parseInt(lender_previous_balance) + parseInt(r2.amount) - parseInt(r2.fees),
      //   "Correct amount not transferred to Lender");
    });

    // it("should get all paid repayment data", async() => {
    //
    //   var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);
    //
    //   var paidRepaymentsCount = await ScaleFiLoan.getPaidRepaymentsCount.call();
    //
    //   var repayments = [];
    //   for(let i=0; i < paidRepaymentsCount; i++) {
    //       var repayment = await ScaleFiLoan.repayments.call(0);
    //       repayments.push(repayment);
    //   }
    //
    //   assert.equal(parseInt(repayments[0].amount), web3.utils.toWei('0.003105', 'ether'),  )
    // })

    it('should return collateral to borrower after loan expiration', async() => {

      await advanceTime(1980);

      var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);

      await ScaleFiLoan.returnCollateralToBorrower({
        from: loanRequest.borrower,
        gas: 300000
      });

      var loan = await ScaleFiLoan.getLoanData.call();

      assert.equal(loan[8], 2, "Collateral Status not set to RETURNED");
      assert.equal(parseInt(loan[10]), 0, "Complete Collateral not returned");

    });

  });

  describe("Scenario 2: Repayments defaulted", () => {

    var ScaleFi, standardToken, loanContractAddress;

    before('Initialize and Deploy SmartContracts', async () => {

      ScaleFi = await ScaleFi.new();
      standardToken = await StandardToken.new("Test Tokens", "TTT", 18, 10000000);

      await standardToken.transfer(borrower, 100000, {
        from: admin,
        gas: 300000
      });

      loanRequest.collateralAddress = standardToken.address;

      var receipt = await ScaleFi.createNewLoanRequest(loanRequest.loanAmount, loanRequest.duration,
        loanRequest.interest, loanRequest.collateralAddress, loanRequest.collateralAmount, loanRequest.collateralPrice, {
        from: loanRequest.borrower,
        gas: 3000000
      });

      loanRequest.loanContractAddress = receipt.logs[0].args[1];

      await standardToken.approve(loanRequest.loanContractAddress, loanRequest.collateralAmount, {
        from: loanRequest.borrower,
        gas: 300000
      });

      var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);

      await ScaleFiLoan.transferCollateralToLoan({
        from: loanRequest.borrower,
        gas: 300000
      });

      await ScaleFiLoan.approveLoanRequest({
        from: loanRequest.lender,
        value: loanRequest.loanAmount,
        gas: 300000
      });

      var r1 = await ScaleFiLoan.getRepaymentAmount.call(1);

      await ScaleFiLoan.repayLoan({
        from: loanRequest.borrower,
        value: parseInt(r1.amount),
        gas: 300000
      });

      await advanceTime(3960);

      var r3 = await ScaleFiLoan.getRepaymentAmount.call(3);
      await ScaleFiLoan.repayLoan({
        from: loanRequest.borrower,
        value: parseInt(r3.amount),
        gas: 300000
      });

      await advanceTime(4000);

    });


    it("shouldn't let borrower repay loan after loan expiration", async() => {

      let addError;

      var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);

      var r4 = await ScaleFiLoan.getRepaymentAmount.call(4);

      try {
        await ScaleFiLoan.repayLoan({
          from: loanRequest.borrower,
          value: parseInt(r4.amount),
          gas: 300000
        });
      } catch (e) {
        addError = e
      }


      assert.notEqual(addError, undefined, 'Transaction should be reverted');

    });

    it('should return collateral to borrower partially', async() => {

      var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);

      await ScaleFiLoan.returnCollateralToBorrower({
        from: loanRequest.borrower,
        gas: 300000
      });

      var loan = await ScaleFiLoan.getLoanData.call();

      assert.equal(loan[8], 2, "Collateral Status not set to RETURNED");
      assert.notEqual(parseInt(loan[10]), 0, "Partial Collateral not returned");

    });

    it('should return remaining collateral to lender', async() => {

      var ScaleFiLoan = await ScaleFiLoan.at(loanRequest.loanContractAddress);

      await ScaleFiLoan.claimCollateralByLender({
        from: loanRequest.lender,
        gas: 300000
      });

      var loan = await ScaleFiLoan.getLoanData.call();

      assert.equal(loan[4], 4, "Loan Status not set to DEFAULT");
      assert.equal(parseInt(loan[10]), 0, "Complete Collateral not returned");

    });

  });

})
