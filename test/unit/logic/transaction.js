'use strict';/*eslint*/

var node = require('./../../node.js');
var ed = require('../../../helpers/ed');
var bignum = require('../../../helpers/bignum.js');
var crypto = require('crypto');
var async = require('async');

var chai = require('chai');
var expect = require('chai').expect;
var _  = require('lodash');
var transactionTypes = require('../../../helpers/transactionTypes');
var slots = require('../../../helpers/slots');

var modulesLoader = require('../../common/initModule').modulesLoader;
var Transaction = require('../../../logic/transaction.js');
var Rounds = require('../../../modules/rounds.js');
var AccountLogic = require('../../../logic/account.js');
var AccountModule = require('../../../modules/accounts.js');

var Vote = require('../../../logic/vote.js');
var Transfer = require('../../../logic/transfer.js');
var Delegate = require('../../../logic/delegate.js');
var Signature = require('../../../logic/signature.js');
var Multisignature = require('../../../logic/multisignature.js');
var Dapp = require('../../../logic/dapp.js');
var InTransfer = require('../../../logic/inTransfer.js');
var OutTransfer = require('../../../logic/outTransfer.js');

var validPassword = 'rally clean ladder crane gadget century timber jealous shine scorpion beauty salon';
var validKeypair = ed.makeKeypair(crypto.createHash('sha256').update(validPassword, 'utf8').digest());

var senderHash = crypto.createHash('sha256').update(node.gAccount.password, 'utf8').digest();
var senderKeypair = ed.makeKeypair(senderHash);

var validSender = {
	username: null,
	isDelegate: 0,
	secondSignature: 0,
	address: 'U810656636599221322',
	publicKey: 'f4011a1360ac2769e066c789acaaeffa9d707690d4d3f6085a7d52756fbc30d0',
	secondPublicKey: null,
	balance: 9850458911801508,
	u_balance: 9850458911801508,
	vote: 0,
	multisignatures: null,
	multimin: 0,
	multilifetime: 0,
	blockId: '8505659485551877884',
	nameexist: 0,
	producedblocks: 0,
	missedblocks: 0,
	fees: 0,
	rewards: 0,
	virgin: 0
};

var validTransactionData = {
	type: 0,
	amount: 8067474861277,
	sender: validSender,
	senderId: 'U810656636599221322',
	recipientId: 'U7771441689362721578',
	fee: 10000000,
	keypair: senderKeypair,
	publicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
};

var validTransaction = {
	id: '15935329205556253322',
	rowId: 133,
	blockId: '6438017970172540087',
	type: 0,
	timestamp: 33363661,
	senderPublicKey: 'f4011a1360ac2769e066c789acaaeffa9d707690d4d3f6085a7d52756fbc30d0',
	senderId: 'U810656636599221322',
	recipientId: 'U9781760580710719871',
	amount: 490000000000000,
	fee: 10000000,
	signature: '85dc703a2b82698193ecbd86fd7aff1b057dfeb86e2a390ef42c1998bf1e9269c0048f42285e208a1e14a63843defbabece1bc96730f317f0cc16e23bb1b4d01',
	signSignature: null,
	requesterPublicKey: null,
	signatures: null,
	asset: {},
};

var existedTransaction = {
    id: '16207561138663598511',
    blockId: '6438017970172540087',
    type: 0,
    senderPublicKey: 'b80bb6459608dcdeb9a98d1f2b0111b2bf11e53ef2933e6769bb0198e3a97aae',
    senderId: 'U15365455923155964650',
    recipientId: 'U9781760580710719871',
    amount: 1960000000000000,
    fee: 10000000,
    signature: 'd8db69f6eb1504b5d6a20dfdab8a35d3742a686d9fb0fe526661754e7afbb9ce86604d3be82f1d5a51f6e5f41a93d1cd926179cdbb13d2d54ff3e2c418919105',
    signSignature: null,
    requesterPublicKey: null,
    signatures: null,
    asset: {},
};

var genesisAcc = { ...validSender,
	...{
        address: 'U15365455923155964650',
        publicKey: 'b80bb6459608dcdeb9a98d1f2b0111b2bf11e53ef2933e6769bb0198e3a97aae'
	}
};

var rawValidTransaction = {
	t_id: '17190511997607511181',
	b_height: 981,
	t_blockId: '6438017970172540087',
	t_type: 0,
	t_timestamp: 33363661,
	t_senderPublicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
	m_recipientPublicKey: null,
	t_senderId: 'U810656636599221322',
	t_recipientId: 'U7771441689362721578',
	t_amount: 490000000000000,
	t_fee: 10000000,
	t_signature: '85dc703a2b82698193ecbd86fd7aff1b057dfeb86e2a390ef42c1998bf1e9269c0048f42285e208a1e14a63843defbabece1bc96730f317f0cc16e23bb1b4d01',
	confirmations: 8343
};

var genesisTrs = {
	type: 0,
	amount: 490000000000000,
	fee: 0,
	timestamp: 0,
	recipientId: 'U7771441689362721578',
	senderId: 'U810656636599221322',
	senderPublicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
	signature: '85dc703a2b82698193ecbd86fd7aff1b057dfeb86e2a390ef42c1998bf1e9269c0048f42285e208a1e14a63843defbabece1bc96730f317f0cc16e23bb1b4d01',
	blockId: '6438017970172540087',
	id: '17190511997607511181'
};

var validUnconfirmedTrs = {
	type: 0,
	amount: 100,
	senderPublicKey: 'f4011a1360ac2769e066c789acaaeffa9d707690d4d3f6085a7d52756fbc30d0',
	senderId: 'U810656636599221322',
	timestamp: 0,
	asset: {},
	recipientId: 'U7771441689362721578',
	fee: 10000000,
};


describe('transaction', function () {

	var transaction;
	var accountModule;

	var attachTransferAsset = function (transaction, accountLogic, rounds, done) {
		modulesLoader.initModuleWithDb(AccountModule, function (err, __accountModule) {
			var transfer = new Transfer();
			transfer.bind(__accountModule, rounds);
			transaction.attachAssetType(transactionTypes.SEND, transfer);
			accountModule = __accountModule;
			done();
		}, {
			logic: {
				account: accountLogic,
				transaction: transaction
			}
		});
	};

	before(function (done) {
		async.auto({
			rounds: function (cb) {
				modulesLoader.initModule(Rounds, modulesLoader.scope,cb);
			},
			accountLogic: function (cb) {
				modulesLoader.initLogicWithDb(AccountLogic, cb);
			},
			transaction: ['accountLogic', function (result, cb) {
				modulesLoader.initLogicWithDb(Transaction, cb, {
					ed: require('../../../helpers/ed'),
					account: result.accountLogic
				});
			}]
		}, function (err, result) {
			transaction = result.transaction;
			transaction.bindModules(result);
			attachTransferAsset(transaction, result.accountLogic, result.rounds, done); 
		});
	});

	describe('create', function () {

		it('should throw an error with no param', function () {
			expect(transaction.create).to.throw();
		});

		it('should throw an error when sender is not set', function () {
			var trsData = _.cloneDeep(validTransactionData);
			delete trsData.sender;
			expect(function () {
				transaction.create(transaction, trsData);
			}).to.throw();
		});

		it('should throw an error when keypair is not set', function () {
			var trsData = _.cloneDeep(validTransactionData);
			delete trsData.keypair;
			expect(function () {
				transaction.create(transaction, trsData);
			}).to.throw();
		});

		it('should return transaction fee based on trs type', function () {
			expect(transaction.create(validTransactionData).fee).to.equal(50000000);
		});
	});

	describe('attachAssetType', function () {

		it('should attach all transaction types', function () {
			var appliedLogic;
			appliedLogic = transaction.attachAssetType(transactionTypes.VOTE, new Vote());
			expect(appliedLogic).to.be.an.instanceof(Vote);
			appliedLogic = transaction.attachAssetType(transactionTypes.SEND, new Transfer());
			expect(appliedLogic).to.be.an.instanceof(Transfer);
			appliedLogic = transaction.attachAssetType(transactionTypes.DELEGATE, new Delegate());
			expect(appliedLogic).to.be.an.instanceof(Delegate);
			appliedLogic = transaction.attachAssetType(transactionTypes.SIGNATURE, new Signature());
			expect(appliedLogic).to.be.an.instanceof(Signature);
			appliedLogic = transaction.attachAssetType(transactionTypes.MULTI, new Multisignature());
			expect(appliedLogic).to.be.an.instanceof(Multisignature);
			appliedLogic = transaction.attachAssetType(transactionTypes.DAPP, new Dapp());
			expect(appliedLogic).to.be.an.instanceof(Dapp);
			appliedLogic = transaction.attachAssetType(transactionTypes.IN_TRANSFER, new InTransfer());
			expect(appliedLogic).to.be.an.instanceof(InTransfer);
			appliedLogic = transaction.attachAssetType(transactionTypes.OUT_TRANSFER, new OutTransfer());
			expect(appliedLogic).to.be.an.instanceof(OutTransfer);
			return transaction;
		});

		it('should throw an error on invalid asset', function () {
			expect(function () {
				var invalidAsset = {};
				transaction.attachAssetType(-1, invalidAsset);
			}).to.throw('Invalid instance interface');
		});

		it('should throw an error with no param', function () {
			expect(transaction.attachAssetType).to.throw();
		});
	});

	describe('sign', function () {
		it('should throw an error with no param', function () {
			expect(transaction.sign).to.throw();
		});

		it('should sign transaction', function () {
			expect(transaction.sign(senderKeypair, validTransaction)).to.be.a('string').which.is.equal('f515b02f88a2d4999badddc7424f600b0f1e8a45d3e50bdf6763479cc20076f80a3b6290ca8fb5c114729ea8da13e787bcfef8693ff61df4a810bc7cfacd8e09');
		});
	});

	// describe('multisign', function () {
	//
	// 	it('should throw an error with no param', function () {
	// 		expect(transaction.multisign).to.throw();
	// 	});
	//
	// 	it('should multisign the transaction', function () {
	// 		expect(transaction.multisign(senderKeypair, validTransaction)).to.equal(validTransaction.signature);
	// 	});
	// });

	describe('getId', function () {

		it('should throw an error with no param', function () {
			expect(transaction.getId).to.throw();
		});

		it('should generate the id of the trs', function () {
			expect(transaction.getId(validTransaction)).to.be.a('string').which.is.equal(validTransaction.id);
		});

		it('should update id if a field in trs value changes', function () {
			var id = validTransaction.id;
			var trs = _.cloneDeep(validTransaction);
			trs.amount = 4000;
			expect(transaction.getId(trs)).to.not.equal(id);
		});
	});

	describe('getHash', function () {

		it('should throw an error with no param', function () {
			expect(transaction.getHash).to.throw();
		});

		it('should return hash for trs', function () {
			var trs = validTransaction;
			var expectedHash = '8a9216c47ba925dd02fbf36a96f0cab5a3407e3f6d3eb4a5cff556cafc076c70';
			expect(transaction.getHash(trs).toString('hex')).to.be.a('string').which.is.equal(expectedHash);
		});

		it('should update hash if a field is trs value changes', function () {
			var originalTrsHash = '5164ef55fccefddf72360ea6e05f19eed7c8d2653c5069df4db899c47246dd2f';
			var trs = _.cloneDeep(validTransaction);
			trs.amount = 4000;
			expect(transaction.getHash(trs).toString('hex')).to.not.equal(originalTrsHash);
		});
	});

	describe('getBytes', function () {

		it('should throw an error with no param', function () {
			expect(transaction.getBytes).to.throw();
		});

		it('should return same result when called multiple times', function () {
			var firstCalculation = transaction.getBytes(validTransaction);
			var secondCalculation = transaction.getBytes(validTransaction);
			expect(firstCalculation.equals(secondCalculation)).to.be.ok;
		});

		// it('should return same result of getBytes using /logic/transaction and lisk-js package (without data field)', function () {
		// 	var trsBytesFromLogic = transaction.getBytes(validTransaction);
		// 	var trsBytesFromLiskJs = node.lisk.crypto.getBytes(validTransaction);
		// 	expect(trsBytesFromLogic.equals(trsBytesFromLiskJs)).to.be.ok;
		// });

		it('should skip signature, second signature for getting bytes', function () {
			var trsBytes = transaction.getBytes(validTransaction, true);
			expect(trsBytes.length).to.equal(53);
		});
	});

	describe('ready', function () {

		it('should throw an error with no param', function () {
			expect(transaction.ready).to.throw();
		});

		it('should throw error when trs type is invalid', function () {
			var trs = _.cloneDeep(validTransaction);
			var invalidTrsType = -1;
			trs.type = invalidTrsType;
			expect(function () {
				transaction.ready(trs, validSender);
			}).to.throw('Unknown transaction type ' + invalidTrsType);
		});

		it('should return false when sender not provided', function () {
			var trs = validTransaction;
			expect(transaction.ready(trs)).to.equal(false);
		});

		it('should return true for valid trs and sender', function () {
			var trs = validTransaction;
			expect(transaction.ready(trs, validSender)).to.equal(true);
		});
	});

	describe('countById', function () {

		it('should throw an error with no param', function () {
			expect(transaction.countById).to.throw();
		});

		it('should return count of trs in db with trs id', function (done) {
			transaction.countById(validTransaction, function (err, count) {
				expect(err).to.not.exist;
				expect(count).to.be.equal(0);
				done();
			});
		});

		it('should return 1 for transaction from genesis block', function (done) {
			transaction.countById(genesisTrs, function (err, count) {
				expect(err).to.not.exist;
				expect(count).to.be.equal(1);
				done();
			});
		});
	});

	describe('checkConfirmed', function () {

		it('should throw an error with no param', function () {
			expect(transaction.checkConfirmed).to.throw();
		});

		it('should not return error when trs is not confirmed', function (done) {
			var trs = transaction.create(validTransactionData);
			transaction.checkConfirmed(trs, function (err) {
				expect(err).to.not.exist;
				done();
			});
		});

		it('should return error for transaction which is already confirmed', function (done) {
			var dummyConfirmedTrs = {
				id: '17190511997607511181'
			};
			transaction.checkConfirmed(dummyConfirmedTrs, function (err) {
				expect(err || []).to.include('Transaction is already confirmed');
				done();
			});
		});
	});

	describe('checkBalance', function () {

		it('should throw an error with no param', function () {
			expect(transaction.checkBalance).to.throw();
		});

		it('should return error when sender has insufficiant balance', function () {
			var amount =  '49000000000000000000000';
			var balanceKey = 'balance';
			var res = transaction.checkBalance(amount, balanceKey, validUnconfirmedTrs, validSender);
			expect(res.exceeded).to.equal(true);
			expect(res.error).to.include('Account does not have enough ADM:');
		});

		it('should be okay if insufficient balance from genesis account', function () {
			var amount =  '999823366072900';
			var balanceKey = 'balance';
			var res = transaction.checkBalance(amount, balanceKey, genesisTrs, validSender);
			expect(res.exceeded).to.equal(false);
			expect(res.error).to.not.exist;
		});

		it('should be okay if sender has sufficient balance', function () {
			var balanceKey = 'balance';
			var res = transaction.checkBalance(validTransaction.amount, balanceKey, validTransaction, validSender);
			expect(res.exceeded).to.equal(false);
			expect(res.error).to.not.exist;
		});
	});

	describe('process', function () {

		it('should throw an error with no param', function () {
			expect(transaction.process).to.throw();
		});

		it('should return error sender is not supplied', function (done) {
			transaction.process(validTransaction, null, function (err, res) {
				expect(err).to.be.equal('Missing sender');
				done();
			});
		});

		it('should return error if generated id is different from id supplied of trs', function (done) {
			var trs = _.cloneDeep(validTransaction);
			trs.id = 'invalid trs id';
			transaction.process(trs, validSender, function (err, res) {
				expect(err).to.equal('Invalid transaction id');
				done();
			});
		});

		it('should return error when failed to generate id', function (done) {
			var trs = {
				type: 0
			};
			transaction.process(trs, validSender, function (err, res) {
				expect(err).to.equal('Failed to get transaction id');
				done();
			});
		});

		it('should process the transaction', function (done) {
			transaction.process(validTransaction, validSender, function (err, res) {
				expect(err).to.not.be.ok;
				expect(res).to.be.an('object');
				expect(res.senderId).to.be.a('string').which.is.equal(validSender.address);
				done();
			});
		});
	});

	describe('verify', function () {

		function createAndProcess (trsData, sender, cb) {
			var trs = transaction.create(trsData);
			transaction.process(trs, sender, function (err, __trs) {
				expect(err).to.not.exist;
				expect(__trs).to.be.an('object');
				cb(__trs);
			});
		}

		it('should return error when sender is missing', function (done) {
			transaction.verify(validTransaction, null, {}, function (err) {
				expect(err).to.equal('Missing sender');
				done();
			});
		});

		it('should return error with invalid trs type', function (done) {
			var trs = _.cloneDeep(validTransaction);
			trs.type = -1;

			transaction.verify(trs, validSender, {}, function (err) {
				expect(err).to.include('Unknown transaction type');
				done();
			});
		});

		// it('should return error when missing sender second signature', function (done) {
		// 	var trs = _.cloneDeep(validTransaction);
		// 	var vs = _.cloneDeep(validSender);
		// 	vs.secondSignature = '839eba0f811554b9f935e39a68b3078f90bea22c5424d3ad16630f027a48362f78349ddc3948360045d6460404f5bc8e25b662d4fd09e60c89453776962df40d';
		//
		// 	transaction.verify(trs, vs, {}, function (err) {
		// 		expect(err).to.include('Missing sender second signature');
		// 		done();
		// 	});
		// });

		// it('should return error when sender does not have a second signature', function (done) {
		// 	var trs = _.cloneDeep(validTransaction);
		// 	trs.signSignature = [transaction.sign(validKeypair, trs)];
		//
		// 	transaction.verify(trs, validSender, {}, function (err) {
		// 		expect(err).to.include('Sender does not have a second signature');
		// 		done();
		// 	});
		// });
		//
		// it('should return error when requester does not have a second signature', function (done) {
		// 	var trs = _.cloneDeep(validTransaction);
		// 	var dummyRequester = {
		// 		secondSignature : 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f'
		// 	};
		// 	trs.requesterPublicKey = '839eba0f811554b9f935e39a68b3078f90bea22c5424d3ad16630f027a48362f78349ddc3948360045d6460404f5bc8e25b662d4fd09e60c89453776962df40d';
		//
		// 	transaction.verify(trs, validSender, dummyRequester, function (err) {
		// 		expect(err).to.include('Missing requester second signature');
		// 		done();
		// 	});
		// });

		it('should return error when trs sender publicKey and sender public key are different', function (done) {
			var trs = _.cloneDeep(validTransaction);
			var invalidPublicKey =  '01389197bbaf1afb0acd47bbfeabb34aca80fb372a8f694a1c0716b3398db746';
			trs.senderPublicKey = invalidPublicKey;

			transaction.verify(trs, validSender, {}, function (err) {
				expect(err).to.include(['Invalid sender public key:', invalidPublicKey, 'expected:', validSender.publicKey].join(' '));
				done();
			});
		});

		it('should be impossible to send the money from genesis account', function (done) {
            var trs = transaction.create(validTransactionData);
			trs.senderId = 'U15365455923155964650';
			trs.senderPublicKey = 'b80bb6459608dcdeb9a98d1f2b0111b2bf11e53ef2933e6769bb0198e3a97aae';
			var vs = _.cloneDeep(validSender);
			vs.publicKey = 'b80bb6459608dcdeb9a98d1f2b0111b2bf11e53ef2933e6769bb0198e3a97aae';
			vs.address = 'U15365455923155964650';
			transaction.verify(trs, vs, {}, function (err) {
				expect(err).to.include('Invalid sender. Can not send from genesis account');
				done();
			});
		});

		it('should return error on different sender address in trs and sender', function (done) {
			var trs = _.cloneDeep(validTransaction);
			trs.senderId = 'U2581762640681118072';

			transaction.verify(trs, validSender, {}, function (err) {
				expect(err).to.include('Invalid sender public key');
				done();
			});
		});

		// it('should return error when Account does not belong to multisignature group', function (done) {
		// 	var trs = _.cloneDeep(validTransaction);
		// 	var vs = _.cloneDeep(validSender);
		// 	// Different publicKey for multisignature account
		// 	vs.multisignatures = [node.eAccount.publicKey];
		// 	trs.requesterPublicKey = validKeypair.publicKey.toString('hex');
		// 	delete trs.signature;
		// 	trs.signature = transaction.sign(validKeypair, trs);
		// 	transaction.verify(trs, vs, {}, function (err) {
		// 		expect(err).to.equal('Account does not belong to multisignature group');
		// 		done();
		// 	});
		// });

		it('should return error when signature is not correct', function (done) {
			var trs = _.cloneDeep(validTransaction);
			// valid keypair is a different account
			trs.signature = transaction.sign(validKeypair, trs);
			transaction.verify(trs, validSender, {}, function (err) {
				expect(err).to.include('Invalid sender public key');
				done();
			});
		});

		// it('should return error when duplicate signature in transaction', function (done) {
		// 	var trs = _.cloneDeep(validTransaction);
		// 	var vs = _.cloneDeep(validSender);
		// 	vs.multisignatures = [validKeypair.publicKey.toString('hex')];
		// 	delete trs.signature;
		// 	trs.signatures = Array.apply(null, Array(2)).map(function () { return transaction.sign(validKeypair, trs); });
		// 	trs.signature = transaction.sign(senderKeypair, trs);
		// 	transaction.verify(trs, vs, {}, function (err) {
		// 		expect(err).to.equal('Encountered duplicate signature in transaction');
		// 		done();
		// 	});
		// });

		// it('should return error when failed to verify multisignature', function (done) {
		// 	var trs = _.cloneDeep(validTransaction);
		// 	var vs = _.cloneDeep(validSender);
		// 	vs.multisignatures = [validKeypair.publicKey.toString('hex')];
		// 	trs.requesterPublicKey = validKeypair.publicKey.toString('hex');
		// 	delete trs.signature;
		// 	// using validKeypair as opposed to senderKeypair
		// 	trs.signatures = [transaction.sign(validKeypair, trs)];
		// 	trs.signature = transaction.sign(validKeypair, trs);
		// 	transaction.verify(trs, vs, {}, function (err) {
		// 		expect(err).to.equal('Failed to verify multisignature');
		// 		done();
		// 	});
		// });
		//
		// it('should be okay with valid multisignature', function (done) {
		// 	var trs = _.cloneDeep(validTransaction);
		// 	var vs = _.cloneDeep(validSender);
		// 	vs.multisignatures = [validKeypair.publicKey.toString('hex')];
		// 	delete trs.signature;
		// 	trs.signature = transaction.sign(senderKeypair, trs);
		// 	trs.signatures = [transaction.multisign(validKeypair, trs)];
		// 	transaction.verify(trs, vs, {}, function (err) {
		// 		expect(err).to.not.exist;
		// 		done();
		// 	});
		// });
		//
		// it('should return error when second signature is invalid', function (done) {
		// 	var vs = _.cloneDeep(validSender);
		// 	vs.secondPublicKey = validKeypair.publicKey.toString('hex');
		// 	vs.secondSignature = 1;
		//
		// 	var trsData = _.cloneDeep(validTransactionData);
		// 	trsData.sender = vs;
		// 	trsData.secondKeypair = validKeypair;
		// 	createAndProcess(trsData, validSender, function (trs) {
		// 		trs.signSignature = '7af5f0ee2c4d4c83d6980a46efe31befca41f7aa8cda5f7b4c2850e4942d923af058561a6a3312005ddee566244346bdbccf004bc8e2c84e653f9825c20be008';
		// 		transaction.verify(trs, vs, function (err) {
		// 			expect(err).to.equal('Failed to verify second signature');
		// 			done();
		// 		});
		// 	});
		// });
		//
		// it('should be okay for valid second signature', function (done) {
		// 	var sender = _.cloneDeep(validSender);
		// 	sender.secondPublicKey = validKeypair.publicKey.toString('hex');
		// 	sender.secondSignature = 1;
		//
		// 	var trsData = _.cloneDeep(validTransactionData);
		// 	trsData.sender = sender;
		// 	trsData.secondKeypair = validKeypair;
		// 	createAndProcess(trsData, validSender, function (trs) {
		// 		transaction.verify(trs, validSender, {}, function (err) {
		// 			transaction.verify(trs, sender, function (err) {
		// 				expect(err).to.not.exist;
		// 				done();
		// 			});
		// 		});
		// 	});
		// });

		it('should throw return error transaction fee is incorrect', function (done) {
			var trs = _.cloneDeep(validTransaction);
			trs.fee = -100;
			var sender = _.cloneDeep(validSender);
			transaction.verify(trs, sender, {}, function (err) {
				expect(err).to.include('Invalid transaction fee');
				done();
			});
		});

		it('should verify transaction with correct fee (without data field)', function (done) {
			transaction.verify(validTransaction, validSender, {}, function (err) {
				expect(err).to.not.exist;
				done();
			});
		});

		it('should return error when transaction amount is invalid', function (done) {
			var trsData = _.cloneDeep(validTransactionData);
			trsData.amount = node.constants.totalAmount + 10;
			createAndProcess(trsData, validSender, function (trs) {
				transaction.verify(trs, validSender, {}, function (err) {
					expect(err).to.include('Invalid transaction amount');
					done();
				});
			});
		});

		it('should return error when account balance is less than transaction amount', function (done) {
			var trsData = _.cloneDeep(validTransactionData);
			trsData.amount = node.constants.totalAmount;
			createAndProcess(trsData, validSender, function (trs) {
				transaction.verify(trs, validSender, {}, function (err) {
					expect(err).to.include('Account does not have enough LSK:');
					done();
				});
			});
		});

		it('should return error on future timestamp', function (done) {
			var trs = _.cloneDeep(validTransaction);
			trs.timestamp = slots.getTime() + 100;
			delete trs.signature;
			trs.signature = transaction.sign(senderKeypair, trs);
			transaction.verify(trs, validSender, {}, function (err) {
				expect(err).to.include('Invalid transaction timestamp');
				done();
			});
		});

		it('should verify proper transaction with proper sender', function (done) {
			transaction.verify(validTransaction, validSender, {}, function (err) {
				expect(err).to.not.be.ok;
				done();
			});
		});

		it('should throw an error with no param', function () {
			expect(transaction.verify).to.throw();
		});
	});

	describe('verifySignature', function () {

		it('should throw an error with no param', function () {
			expect(transaction.verifySignature).to.throw();
		});

		it('should return false if trs is changed', function () {
			var trs = _.cloneDeep(validTransaction);
			// change trs value
			trs.amount = 1001;
			expect(transaction.verifySignature(trs, validSender.publicKey, trs.signature)).to.equal(false);
		});

		it('should return false if signature not provided', function () {
			var trs = validTransaction;
			expect(transaction.verifySignature(trs, validSender.publicKey, null)).to.equal(false);
		});

		it('should return valid signature for correct trs', function () {
			var trs = validTransaction;
			expect(transaction.verifySignature(trs, validSender.publicKey, trs.signature)).to.equal(true);
		});

		it('should throw if public key is invalid', function () {
			var trs = validTransaction;
			var invalidPublicKey = '123123123';
			expect(function () {
				transaction.verifySignature(trs, invalidPublicKey, trs.signature);
			}).to.throw();
		});
	});

	describe('verifySecondSignature', function () {

		it('should throw an error with no param', function () {
			expect(transaction.verifySecondSignature).to.throw();
		});

		it('should verify the second signature correctly', function () {
			var signature = transaction.sign(validKeypair, validTransaction);
			expect(transaction.verifySecondSignature(validTransaction, validKeypair.publicKey.toString('hex'), signature)).to.equal(true);
		});
	});

	describe('verifyBytes', function () {

		it('should throw an error with no param', function () {
			expect(transaction.verifyBytes).to.throw();
		});

		it('should return when sender public is different', function () {
			var trsBytes = transaction.getBytes(validTransaction);
			var invalidPublicKey = 'addb0e15a44b0fdc6ff291be28d8c98f5551d0cd9218d749e30ddb87c6e31ca9';
			expect(transaction.verifyBytes(trsBytes, invalidPublicKey, validTransaction.signature)).to.equal(false);
		});

		it('should throw when publickey is not in the right format', function () {
			var trsBytes = transaction.getBytes(validTransaction);
			var invalidPublicKey = 'iddb0e15a44b0fdc6ff291be28d8c98f5551d0cd9218d749e30ddb87c6e31ca9';
			expect(function () {
				transaction.verifyBytes(trsBytes, invalidPublicKey, validTransaction.signature);
			}).to.throw();
		});

		it('should be okay for valid bytes', function () {
			var trsBytes = transaction.getBytes(validTransaction, true, true);
			var res = transaction.verifyBytes(trsBytes, validTransaction.senderPublicKey, validTransaction.signature);
			expect(res).to.equal(true);
		});
	});

	describe('apply', function () {
		var dummyBlock = {
			id: '9314232245035524467',
			height: 1
		};

		function undoTransaction (trs, sender, done) {
			transaction.undo(trs, dummyBlock, sender, done); 
		}

		it('should throw an error with no param', function () {
			expect(function () { transaction.apply(); }).to.throw();
		});

		it('should be okay with valid params', function (done) {
			var trs = validUnconfirmedTrs;
			transaction.apply(trs, dummyBlock, validSender, done);
		});

		it('should return error on if balance is low', function (done) {
			var trs = _.cloneDeep(validTransaction);
			trs.amount = '9850458911801908';

			transaction.apply(trs, dummyBlock, validSender, function (err) {
				expect(err).to.include('Account does not have enough ');
				done();
			});
		});

		it('should subtract balance from sender account on valid transaction', function (done) {
			accountModule.getAccount({publicKey: validTransaction.senderPublicKey}, function (err, accountBefore) {
				var amount = new bignum(validTransaction.amount.toString()).plus(validTransaction.fee.toString());
				var balanceBefore = new bignum(accountBefore.balance.toString());

				transaction.apply(validTransaction, dummyBlock, validSender, function (err) {
					accountModule.getAccount({publicKey: validTransaction.senderPublicKey}, function (err, accountAfter) {
						expect(err).to.not.exist;
						var balanceAfter = new bignum(accountAfter.balance.toString());
						expect(balanceAfter.plus(amount).toString()).to.equal(balanceBefore.toString());
						undoTransaction(validTransaction, validSender, done);
					});
				});
			});
		});
	});

	describe('undo', function () {
		var dummyBlock = {
			id: '9314232245035524467',
			height: 1
		};

		function applyTransaction (trs, sender, done) {
			transaction.apply(trs, dummyBlock, sender, done);
		}

		it('should throw an error with no param', function () {
			expect(transaction.undo).to.throw();
		});

		it('should not update sender balance when transaction is invalid', function (done) {

			var trs = _.cloneDeep(validTransaction);
			var amount = new bignum(trs.amount.toString()).plus(trs.fee.toString());
			delete trs.recipientId;

			accountModule.getAccount({publicKey: trs.senderPublicKey}, function (err, accountBefore) {
				var balanceBefore = new bignum(accountBefore.balance.toString());

				transaction.undo(trs, dummyBlock, validSender, function (err) {
					accountModule.getAccount({publicKey: trs.senderPublicKey}, function (err, accountAfter) {
						var balanceAfter = new bignum(accountAfter.balance.toString());

						expect(balanceBefore.plus(amount.mul(2)).toString()).to.not.equal(balanceAfter.toString());
						expect(balanceBefore.toString()).to.equal(balanceAfter.toString());
						done();
					});
				});
			});
		});

		it('should be okay with valid params', function (done) {
			var trs = validTransaction;
			var amount = new bignum(trs.amount.toString()).plus(trs.fee.toString());

			accountModule.getAccount({publicKey: trs.senderPublicKey}, function (err, accountBefore) {
				var balanceBefore = new bignum(accountBefore.balance.toString());

				transaction.undo(trs, dummyBlock, validSender, function (err) {
					accountModule.getAccount({publicKey: trs.senderPublicKey}, function (err, accountAfter) {
						expect(err).to.not.exist;

						var balanceAfter = new bignum(accountAfter.balance.toString());
						expect(balanceBefore.plus(amount).toString()).to.equal(balanceAfter.toString());
						applyTransaction(trs, validSender, done);
					});
				});
			});
		});
	});

	describe('applyUnconfirmed', function () {

		function undoUnconfirmedTransaction (trs, sender, done) {
			transaction.undoUnconfirmed(trs, sender, done); 
		}

		it('should throw an error with no param', function () {
			expect(function () { transaction.applyUnconfirmed(); }).to.throw();
		});

		it('should be okay with valid params', function (done) {
			var trs = validTransaction;
			transaction.applyUnconfirmed(trs, validSender, done);
		});

		it('should return error on if balance is low', function (done) {
			var trs = _.cloneDeep(validTransaction);
			trs.amount = '9850458911801908';

			transaction.applyUnconfirmed(trs, validSender, function (err) {
				expect(err).to.include('Account does not have enough ');
				done();
			});
		});

		it('should okay for valid params', function (done) {
			transaction.applyUnconfirmed(validTransaction, validSender, function (err) {
				expect(err).to.not.exist;
				undoUnconfirmedTransaction(validTransaction, validSender, done);
			});
		});
	});

	describe('undoUnconfirmed', function () {

		function applyUnconfirmedTransaction (trs, sender, done) {
			transaction.applyUnconfirmed(trs, sender, done);
		}

		it('should throw an error with no param', function () {
			expect(transaction.undoUnconfirmed).to.throw();
		});

		it('should be okay with valid params', function (done) {
			transaction.undoUnconfirmed(validTransaction, validSender, function (err) {
				expect(err).to.not.exist;
				applyUnconfirmedTransaction(validTransaction, validSender, done);
			}); 
		});
	});

	describe('dbSave', function () {

		it('should throw an error with no param', function () {
			expect(transaction.dbSave).to.throw();
		});

		it('should throw an error when type is not specified', function () {
			var trs = _.cloneDeep(validTransaction);
			delete trs.type;
			expect(function () {
				transaction.dbSave(trs);
			}).to.throw();
		});

		it('should create comma separated trs signatures', function () {
			var trs = _.cloneDeep(validTransaction);
			var vs = _.cloneDeep(validSender);
			vs.multisignatures = [validKeypair.publicKey.toString('hex')];
			delete trs.signature;
			trs.signature = transaction.sign(senderKeypair, trs);
			trs.signatures = [transaction.multisign(validKeypair, trs)];
			var savePromise = transaction.dbSave(trs);
			expect(savePromise).to.be.an('Array');
			expect(savePromise).to.have.length(1);
			var trsValues = savePromise[0].values;
			expect(trsValues).to.have.property('signatures').which.is.equal(trs.signatures.join(','));
		});

		it('should return promise object for valid parameters', function () {
			var savePromise = transaction.dbSave(validTransaction);
			var keys = [
				'table',
				'fields',
				'values'
			];
			var valuesKeys = [
				'id',
				'blockId',
				'type',
				'timestamp',
				'senderPublicKey',
				'requesterPublicKey',
				'senderId',
				'recipientId',
				'amount',
				'fee',
				'signature',
				'signSignature',
				'signatures'
			];
			expect(savePromise).to.be.an('Array');
			expect(savePromise).to.have.length(1);
			expect(savePromise[0]).to.have.keys(keys);
			expect(savePromise[0].values).to.have.keys(valuesKeys);
		});
	});

	describe('afterSave', function () {

		it('should throw an error with no param', function () {
			expect(transaction.afterSave).to.throw();
		});

		it('should invoke the passed callback', function (done) {
			transaction.afterSave(validTransaction, done);
		});
	});

	describe('objectNormalize', function () {

		it('should throw an error with no param', function () {
			expect(transaction.objectNormalize).to.throw();
		});

		it('should remove keys with null or undefined attribute', function () {
			var trs = _.cloneDeep(validTransaction);
			trs.amount = null;
			expect(_.keys(transaction.objectNormalize(trs))).to.not.include('amount');
		});

		it('should not remove any keys with valid entries', function () {
			expect(_.keys(transaction.objectNormalize(validTransaction))).to.have.length(11);
		});

		it('should throw error for invalid schema types', function () {
			var trs = _.cloneDeep(validTransaction);
			trs.amount = 'Invalid value';
			expect(function () {
				transaction.objectNormalize(trs);
			}).to.throw();
		});
	});

	describe('dbRead', function () {

		it('should throw an error with no param', function () {
			expect(transaction.dbRead).to.throw();
		});

		it('should return null if id field is not present', function () {
			var rawTrs = _.cloneDeep(rawValidTransaction);
			delete rawTrs.t_id;
			var trs = transaction.dbRead(rawTrs);
			expect(trs).to.be.a('null');
		});

		it('should return transaction object with correct fields', function () {
			var rawTrs = _.cloneDeep(rawValidTransaction);
			var trs = transaction.dbRead(rawTrs);
			var expectedKeys = [
				'id',
				'height',
				'blockId',
				'type',
				'timestamp',
				'senderPublicKey',
				'requesterPublicKey',
				'senderId',
				'recipientId',
				'recipientPublicKey',
				'amount',
				'fee',
				'signature',
				'signSignature',
				'signatures',
				'confirmations',
				'asset',
			];
			expect(trs).to.be.an('object');
			expect((trs)).to.have.keys(expectedKeys);
		});
	});
});
