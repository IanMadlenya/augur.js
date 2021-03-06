/**
 * Logging/filter tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var abi = require("augur-abi");
var api = new require("augur-contracts").Tx();
var tools = require("../../tools");
var constants = require("../../../src/constants");
var augurpath = "../../../src/index";
var augur = new (require(augurpath))();
var utils = require("../../../src/utilities");

var DEBUG = false;
var DELAY = 2500;

describe("format_trade_type", function() {
  // 6 tests total
  var test = function(t) {
    it(JSON.stringify(t), function() {
      t.assertions(augur.filters.format_trade_type(t.type));
    });
  };
  test({
    type: '0x1',
    assertions: function(type) {
      assert.deepEqual(type, 'buy');
    }
  });
  test({
    type: '1',
    assertions: function(type) {
      assert.deepEqual(type, 'buy');
    }
  });
  test({
    type: 1,
    assertions: function(type) {
      assert.deepEqual(type, 'buy');
    }
  });
  test({
    type: '0x2',
    assertions: function(type) {
      assert.deepEqual(type, 'sell');
    }
  });
  test({
    type: '2',
    assertions: function(type) {
      assert.deepEqual(type, 'sell');
    }
  });
  test({
    type: 2,
    assertions: function(type) {
      assert.deepEqual(type, 'sell');
    }
  });
});
describe("format_common_fields", function() {
  // 2 tests total
  var test = function(t) {
    it(JSON.stringify(t), function() {
      t.assertions(augur.filters.format_common_fields(t.msg));
    });
  };
  test({
    msg: {
      sender: '0x1',
      timestamp: 15000000,
      type: 1,
      price: '500000000000000000',
      amount: '10000000000000000000'
    },
    assertions: function(msg) {
      assert.deepEqual(msg, {
        sender: '0x0000000000000000000000000000000000000001',
        timestamp: 352321536,
        type: 'buy',
        price: '0.5',
        amount: '10'
      });
    }
  });
  test({
    msg: {
      sender: '0x2',
      timestamp: 15000000,
      type: 2,
      price: '750000000000000000',
      amount: '25000000000000000000'
    },
    assertions: function(msg) {
      assert.deepEqual(msg, {
        sender: '0x0000000000000000000000000000000000000002',
        timestamp: 352321536,
        type: 'sell',
        price: '0.75',
        amount: '25'
      });
    }
  });
});
describe("format_event_message", function() {
  // 21 tests total
  var test = function(t) {
    it(JSON.stringify(t), function() {
      t.assertions(augur.filters.format_event_message(t.label, t.msg));
    });
  };
  test({
    label: 'Approval',
    msg: {
      _owner: '0x1',
      _spender: '0x2',
      value: abi.fix('10')
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        _owner: '0x0000000000000000000000000000000000000001',
        _spender: '0x0000000000000000000000000000000000000002',
        value: '10'
      }));
    }
  });
  test({
    label: 'collectedFees',
    msg: {
      cashFeesCollected: abi.fix('13.575'),
      newCashBalance: abi.fix('10000'),
      lastPeriodRepBalance: abi.fix('99'),
      repGain: abi.fix('10'),
      newRepBalance: abi.fix('109'),
      notReportingBond: abi.fix('100'),
      totalReportingRep: abi.fix('90'),
      period: abi.hex('15'),
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        cashFeesCollected: '13.575',
        newCashBalance: '10000',
        lastPeriodRepBalance: '99',
        repGain: '10',
        newRepBalance: '109',
        notReportingBond: '100',
        totalReportingRep: '90',
        period: 15,
      }));
    }
  });
  test({
    label: 'deposit',
    msg: {
      value: abi.fix('100')
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        value: '100'
      }));
    }
  });
  test({
    label: 'fundedAccount',
    msg: {
      cashBalance: abi.fix('10000'),
      repBalance: abi.fix('47')
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        cashBalance: '10000',
        repBalance: '47'
      }));
    }
  });
  test({
    label: 'log_add_tx',
    msg: {
      outcome: abi.hex('1'),
      isShortAsk: '1'
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        outcome: 1,
        isShortAsk: true
      }));
    }
  });
  test({
    label: 'log_add_tx',
    msg: {
      outcome: abi.hex('2'),
      isShortAsk: '0'
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        outcome: 2,
        isShortAsk: false
      }));
    }
  });
  test({
    label: 'log_cancel',
    msg: {
      outcome: abi.hex('2'),
      cashRefund: abi.fix('100.5034')
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        outcome: 2,
        cashRefund: '100.5034'
      }));
    }
  });
  test({
    label: 'log_fill_tx',
    msg: {
      owner: '0x1',
      takerFee: abi.fix('0.03'),
      makerFee: abi.fix('0.01'),
      onChainPrice: abi.fix('0.5'),
      outcome: '1',
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        owner: '0x0000000000000000000000000000000000000001',
        takerFee: '0.03',
        makerFee: '0.01',
        onChainPrice: '0.5',
        outcome: 1,
        type: 'sell',
        isShortSell: true
      }));
    }
  });
  test({
    label: 'log_short_fill_tx',
    msg: {
      owner: '0x2',
      type: '0x1',
      takerFee: abi.fix('0.02'),
      makerFee: abi.fix('0.01'),
      onChainPrice: abi.fix('0.6'),
      outcome: '2',
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        owner: '0x0000000000000000000000000000000000000002',
        type: 'buy',
        takerFee: '0.02',
        makerFee: '0.01',
        onChainPrice: '0.6',
        outcome: 2,
      }));
    }
  });
  test({
    label: 'marketCreated',
    msg: {
      marketCreationFee: abi.fix('1500'),
      eventBond: abi.fix('1000'),
      topic: augur.formatTag('testing')
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        marketCreationFee: '1500',
        eventBond: '1000',
        topic: 'testing'
      }));
    }
  });
  test({
    label: 'payout',
    msg: {
      cashPayout: abi.fix('2500'),
      cashBalance: abi.fix('12500'),
      shares: abi.fix('200'),
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        cashPayout: '2500',
        cashBalance: '12500',
        shares: '200',
      }));
    }
  });
  test({
    label: 'penalizationCaughtUp',
    msg: {
      penalizedFrom: abi.hex('10'),
      penalizedUpTo: abi.hex('100'),
      repLost: abi.fix('78.39'),
      newRepBalance: abi.fix('221.71'),
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        penalizedFrom: 10,
        penalizedUpTo: 100,
        repLost: '-78.39',
        newRepBalance: '221.71',
      }));
    }
  });
  test({
    label: 'penalize',
    msg: {
      oldrep: abi.fix('400'),
      repchange: abi.fix('20'),
      p: abi.fix('10'),
      penalizedUpTo: abi.hex('200'),
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        oldrep: '400',
        repchange: '20',
        p: '10',
        penalizedUpTo: 200,
      }));
    }
  });
  test({
    label: 'sentCash',
    msg: {
      _from: '1',
      _to: '2',
      _value: abi.fix('125'),
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        _from: '0x0000000000000000000000000000000000000001',
        _to: '0x0000000000000000000000000000000000000002',
        _value: '125',
      }));
    }
  });
  test({
    label: 'Transfer',
    msg: {
      _from: '3',
      _to: '4',
      _value: abi.fix('312'),
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        _from: '0x0000000000000000000000000000000000000003',
        _to: '0x0000000000000000000000000000000000000004',
        _value: '312',
      }));
    }
  });
  test({
    label: 'slashedRep',
    msg: {
      reporter: '0x1',
      repSlashed: abi.fix('5'),
      slasherBalance: abi.fix('95'),
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        reporter: '0x0000000000000000000000000000000000000001',
        repSlashed: '5',
        slasherBalance: '95',
      }));
    }
  });
  test({
    label: 'submittedReport',
    msg: {
      ethics: abi.fix('20')
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        ethics: '20'
      }));
    }
  });
  test({
    label: 'submittedReportHash',
    msg: {
      ethics: abi.fix('34')
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        ethics: '34'
      }));
    }
  });
  test({
    label: 'tradingFeeUpdated',
    msg: {
      tradingFee: abi.fix('0.03')
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        tradingFee: '0.03'
      }));
    }
  });
  test({
    label: 'withdraw',
    msg: {
      to: '0x1',
      value: abi.fix('153.25')
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        to: '0x0000000000000000000000000000000000000001',
        value: '153.25'
      }));
    }
  });
  test({
    label: 'a label we dont recognize in this function',
    msg: {
      sender: '0x1',
      amount: abi.fix('10'),
      price: abi.fix('5'),
      type: '1'
    },
    assertions: function(msg) {
      assert.deepEqual(JSON.stringify(msg), JSON.stringify({
        sender: '0x0000000000000000000000000000000000000001',
        amount: '10',
        price: '5',
        type: 'buy'
      }));
    }
  });
});
describe("parse_block_message", function () {
  var test = function (msg) {
    it(JSON.stringify(msg), function (done) {
      augur.filters.parse_block_message(msg, function (parsed) {
        if (DEBUG) console.log("parse_block_message:", parsed);
        done();
      });
    });
  };
  test({
    difficulty: '0x46015d94',
    extraData: '0xd783010500844765746887676f312e352e31856c696e7578',
    gasLimit: '0x47e7c4',
    gasUsed: '0xa410',
    hash: '0x96a9e1fd64969355521cbfd125569d6bb0088f36685200db58b77ca7a7fbebd6',
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    miner: '0xdf712c685be75739eb44cb6665f92129e45864e4',
    nonce: '0x32894b6becfa3b8e',
    number: '0x11941a',
    parentHash: '0xeada45540e0e1505ac0b6759e429ce8dc24a65c6e4c9bc3346a0cd3f22297d1e',
    receiptRoot: '0x204590761a4d9f825ebf97f82f663979e78ce7caab303688bc6815e62b5f012b',
    sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    size: '0x302',
    stateRoot: '0x381b58ccdb2a890a89b9f7e6110429acadb2884199962497a267ef3b054e3c52',
    timestamp: '0x576469fe',
    totalDifficulty: '0xf109f9a4e6f3',
    transactionsRoot: '0x4f90d1155e24c3e52f0c44c6e1b5eafa4395e196339749d0453600017627df4e',
    uncles: []
  });
  test({
    difficulty: '0x45c62a5a',
    extraData: '0xd783010500844765746887676f312e352e31856c696e7578',
    gasLimit: '0x47e7c4',
    gasUsed: '0x0',
    hash: '0xa4cd3abb9124548b39454f8a26d52edc1ba0df5e7ae026430b123829e58b31e9',
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    miner: '0xdf712c685be75739eb44cb6665f92129e45864e4',
    nonce: '0x179b12d04951c04b',
    number: '0x11961c',
    parentHash: '0x1272370c853752237b18561f6409f24a486ff1b842189d2e6c264b2c8b5de043',
    receiptRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
    sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    size: '0x21b',
    stateRoot: '0x571ee6e9fc9845031a13ff885db64249405dec8fde94d6520488214f09722760',
    timestamp: '0x57648769',
    totalDifficulty: '0xf196b3653c38',
    transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
    uncles: []
  });
  test({
    difficulty: '0x456f3e0b',
    extraData: '0xd783010500844765746887676f312e352e31856c696e7578',
    gasLimit: '0x47e7c4',
    gasUsed: '0x493e0',
    hash: '0x6eb2ccd03087179bf53e32ef89db8ae1a7d4c407c691f31c467825e631a53c02',
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    miner: '0xdf712c685be75739eb44cb6665f92129e45864e4',
    nonce: '0xd3764129399cdce6',
    number: '0x119633',
    parentHash: '0x9b3dda703bc0de8a2162adb1666880f1dca6f421190616733c7b5a3e127ec7eb',
    receiptRoot: '0x197e4c93706b5c8d685a47909374a99b096948295abba0578aae46708a1e4435',
    sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    size: '0x2b6',
    stateRoot: '0x385a5bdca25f1214fd9e244ac7146cf9dfc21f6a4dfe29819cdd069b2bfc63b8',
    timestamp: '0x57648910',
    totalDifficulty: '0xf19cf28ef992',
    transactionsRoot: '0x7c416eb59638d9a58ec5f526dd1b4326f37e50fa3968700e28d5f65f704e85fc',
    uncles: []
  });
  test([{
    difficulty: '0x456f3e0b',
    extraData: '0xd783010500844765746887676f312e352e31856c696e7578',
    gasLimit: '0x47e7c4',
    gasUsed: '0x493e0',
    hash: '0x6eb2ccd03087179bf53e32ef89db8ae1a7d4c407c691f31c467825e631a53c02',
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    miner: '0xdf712c685be75739eb44cb6665f92129e45864e4',
    nonce: '0xd3764129399cdce6',
    number: '0x119633',
    parentHash: '0x9b3dda703bc0de8a2162adb1666880f1dca6f421190616733c7b5a3e127ec7eb',
    receiptRoot: '0x197e4c93706b5c8d685a47909374a99b096948295abba0578aae46708a1e4435',
    sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    size: '0x2b6',
    stateRoot: '0x385a5bdca25f1214fd9e244ac7146cf9dfc21f6a4dfe29819cdd069b2bfc63b8',
    timestamp: '0x57648910',
    totalDifficulty: '0xf19cf28ef992',
    transactionsRoot: '0x7c416eb59638d9a58ec5f526dd1b4326f37e50fa3968700e28d5f65f704e85fc',
    uncles: []
  }]);
  test([{
    difficulty: '0x456f3e0b',
    extraData: '0xd783010500844765746887676f312e352e31856c696e7578',
    gasLimit: '0x47e7c4',
    gasUsed: '0x493e0',
    hash: '0x6eb2ccd03087179bf53e32ef89db8ae1a7d4c407c691f31c467825e631a53c02',
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    miner: '0xdf712c685be75739eb44cb6665f92129e45864e4',
    nonce: '0xd3764129399cdce6',
    number: undefined,
    parentHash: '0x9b3dda703bc0de8a2162adb1666880f1dca6f421190616733c7b5a3e127ec7eb',
    receiptRoot: '0x197e4c93706b5c8d685a47909374a99b096948295abba0578aae46708a1e4435',
    sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    size: '0x2b6',
    stateRoot: '0x385a5bdca25f1214fd9e244ac7146cf9dfc21f6a4dfe29819cdd069b2bfc63b8',
    timestamp: '0x57648910',
    totalDifficulty: '0xf19cf28ef992',
    transactionsRoot: '0x7c416eb59638d9a58ec5f526dd1b4326f37e50fa3968700e28d5f65f704e85fc',
    uncles: []
  }]);
});
describe("parse_contracts_message", function () {
  var test = function (msg) {
    it(JSON.stringify(msg), function (done) {
      augur.filters.parse_contracts_message(msg, function (parsed) {
        if (DEBUG) console.log("parse_contracts_message:", parsed);
        done();
      });
    });
  };
  test([{
    "address": "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
    "blockHash": "0x949556543bbbefc3e440abe08606c8a1903c6d9c100c3e93bdd3f6bc4cdd9974",
    "blockNumber": "0x119406",
    "data": "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000851eb851eb851eb8000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000011f32619b74f9d54f77d94a7f86aef48d67421770774953d023f3c4f0e7bf2a8d",
    "logIndex": "0x0",
    "topics": [
      "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
      "0xebb0d4c04bc87d3b401a5baad3b093a5e7cc3f4e996dc53e36db78c8b374cc9a"
    ],
    "transactionHash": "0xd0f3c5d28308f55f00ad7456e4060ae638acd4927ca79165f620fa970d692201",
    "transactionIndex": "0x0"
  }]);
  test([{
    "address": "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
    "blockHash": "0x0e2f477418a6cc65306a2559a611cafc22d50505b493a1e3674ad9c8076e15e2",
    "blockNumber": "0x11963b",
    "data": "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000df8a189bb07bf96c000000000000000000000000000000000000000000000149000000000000000000000000000000000000000000000000000000000000000000000000000000024eef144a1d15da2a6ad96e36147f3fee70e0ecc3a4f0cbb3932fbd7133809f09",
    "logIndex": "0x2",
    "topics": [
      "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
      "0x3b19a87dc13d7c9165f444bef3044543c132cbd979f062f2459ef3725633a3f4"
    ],
    "transactionHash": "0xe0384041bbc3b637fddc2835841b25d14f893e6cf9866032a13e5fd5068e4ab6",
    "transactionIndex": "0x2"
  }]);
  test([{
    "address": "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
    "blockHash": "0x8c3fa0f2a092adf52702b8ebda332c12311f32a9d7dbeca3fd7ad3237a1b143a",
    "blockNumber": "0x11964c",
    "data": "0x000000000000000000000000ae1ba9370f9c3d64894ed9a101079fd17bf1044800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000001d7dd185ffffff8d00000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000002ccb7a4c7d0c9a0de5c08c459ce78642b23fdbd9df707781a9f4c24f9c1205bfd",
    "logIndex": "0x1",
    "topics": [
      "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
      "0xbbc704ce88ff685a56a6a8e708cec54f981d750d8fe83a53d8c4ffb2d4bf4ddd"
    ],
    "transactionHash": "0xa1796f1e7bd1290ba695908a2633a5164deb83c1431c5106c51fb186e79c257e",
    "transactionIndex": "0x3"
  }]);
});
describe("parse_event_message", function () {
  var test = function (t) {
    it(t.label + ": " + JSON.stringify(t.msg), function (done) {
      augur.filters.parse_event_message(t.label, t.msg, function (parsed) {
        var inputs = api.events[t.label].inputs;
        if (t.label === "log_fill_tx") {
          assert.property(parsed, "market");
          assert.property(parsed, "type");
          assert.property(parsed, "sender");
          assert.property(parsed, "owner");
          assert.property(parsed, "price");
          assert.property(parsed, "tradeid");
          assert.property(parsed, "outcome");
          assert.property(parsed, "blockNumber");
          assert.strictEqual(t.msg[0].topics[1], parsed.market);
          assert.strictEqual(abi.format_address(t.msg[0].topics[2]), parsed.sender);
          assert.strictEqual(abi.format_address(t.msg[0].topics[3]), parsed.owner);
          assert.strictEqual(parseInt(t.msg[0].blockNumber, 16), parsed.blockNumber);
        } else if (t.label === "log_add_tx") {
          assert.property(parsed, "market");
          assert.property(parsed, "sender");
          assert.property(parsed, "type");
          assert.property(parsed, "price");
          assert.property(parsed, "amount");
          assert.property(parsed, "outcome");
          assert.property(parsed, "blockNumber");
          assert.strictEqual(t.msg[0].topics[1], parsed.market);
          assert.strictEqual(abi.format_address(t.msg[0].topics[2]), parsed.sender);
          assert.strictEqual(parseInt(t.msg[0].blockNumber, 16), parsed.blockNumber);
        } else if (t.label === "log_cancel") {
          assert.property(parsed, "market");
          assert.property(parsed, "sender");
          assert.property(parsed, "type");
          assert.property(parsed, "price");
          assert.property(parsed, "amount");
          assert.property(parsed, "outcome");
          assert.property(parsed, "cashRefund");
          assert.property(parsed, "blockNumber");
          assert.strictEqual(t.msg[0].topics[1], parsed.market);
          assert.strictEqual(abi.format_address(t.msg[0].topics[2]), parsed.sender);
          assert.strictEqual(parseInt(t.msg[0].blockNumber, 16), parsed.blockNumber);
        } else if (t.label === "tradingFeeUpdated") {
          assert.property(parsed, "marketID");
          assert.property(parsed, "tradingFee");
          assert.deepEqual(parsed.marketID, "0xe7d9beacb528f154ea5bbe325c2497cdb2a208f7fb8460bdf1dbc26e7190775b");
        } else {
          for (var i = 0; i < inputs.length; ++i) {
            assert.property(parsed, inputs[i].name);
            assert.isNotNull(parsed[inputs[i].name]);
          }
        }
        done();
      });
    });
  };
  test({
    label: "log_add_tx",
    msg: [{
      address: "0xd70c6e1f3857d23bd96c3e4d2ec346fa7c3931f3",
      topics: [
        "0x331abc0b32c392f5cdc23a50af9497ab6b82f29ec2274cc33a409e7ab3aedc6c",
        "0xf3efc5085628de2b511a0243bdc9dc7b50ee2440398e626d93280601e3a15634",
        "0x000000000000000000000000d21aa876fe86b0a87f5b6df773d782e1f9bd04df"
      ],
      data: "0000000000000000000000000000000000000000000000000000000000000001",
      blockNumber: "0xc0",
      transactionIndex: "0x0",
      transactionHash: "0x3be9cc70b44bdb25829849f2d2150b5f932b744307ba5b2257e745db6af684de",
      blockHash: "0xf0d3b933c550a39ced64969f856575a3e7876e89288f427d0d876168c9645d3c",
      logIndex: "0x0",
      removed: false
    }]
  });
  test({
    label: "log_add_tx",
    msg: [{
      address: "0xd70c6e1f3857d23bd96c3e4d2ec346fa7c3931f3",
      topics: [
        "0x331abc0b32c392f5cdc23a50af9497ab6b82f29ec2274cc33a409e7ab3aedc6c",
        "0xf3efc5085628de2b511a0243bdc9dc7b50ee2440398e626d93280601e3a15634",
        "0x000000000000000000000000d21aa876fe86b0a87f5b6df773d782e1f9bd04df"
      ],
      data: "0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000006f05b59d3b200000000000000000000000000000000000000000000000000001bc16d674ec800000000000000000000000000000000000000000000000000000000000000000002018696fb83c9b609f9b34afc4df42249f2530953fcd019098c70044c9fa1d95400000000000000000000000000000000000000000000000000000000585e00fa",
      blockNumber: "0xc0",
      transactionIndex: "0x0",
      transactionHash: "0x3be9cc70b44bdb25829849f2d2150b5f932b744307ba5b2257e745db6af684de",
      blockHash: "0xf0d3b933c550a39ced64969f856575a3e7876e89288f427d0d876168c9645d3c",
      logIndex: "0x0",
      removed: false
    }]
  });
  test({
    label: "log_add_tx",
    msg: [{
      address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
      blockHash: "0xf36f8a64964ad218c140d4fe7f35e3ff102a2da044323a58b5eea84a2953a4fb",
      blockNumber: "0x11962d",
      data: "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000f018ac6a199998f600000000000000000000000000000000000000000000009000000000000000000000000000000000000000000000000000000000000000000000000000000002c5a915396f55abfa25862758001012dd5d0d73c0036c21b7244ee58499293dd3",
      logIndex: "0x0",
      topics: [
        "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
        "0x912461a845a572a1fff40a3013bfd639c53493d5b89099e0462ca26cc02be35e"
      ],
      transactionHash: "0xe0932645a38d2bbba352d12ecdfa17abc30131da3f04c53db9ae4030ffc8374c",
      transactionIndex: "0x1"
    }]
  });
  test({
    label: "log_add_tx",
    msg: [{
      address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
      blockHash: "0x0e2f477418a6cc65306a2559a611cafc22d50505b493a1e3674ad9c8076e15e2",
      blockNumber: "0x11963b",
      data: "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000a3778633199999bd0000000000000000000000000000000000000000000000d70000000000000000000000000000000000000000000000000000000000000000000000000000000233647cb4e21faa8ce19ca0ddb3d0bdaa59dfe2643707f25656a1a8e67890f506",
      logIndex: "0x0",
      topics: [
        "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
        "0x3b19a87dc13d7c9165f444bef3044543c132cbd979f062f2459ef3725633a3f4"
      ],
      transactionHash: "0x409156212bd92eec4273032b5b9c2d6ae8d73eb9169df2b181b78d8a463465a4",
      transactionIndex: "0x0"
    }]
  });
  test({
    label: "log_add_tx",
    msg: [{
      address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
      blockHash: "0x0e2f477418a6cc65306a2559a611cafc22d50505b493a1e3674ad9c8076e15e2",
      blockNumber: "0x11963b",
      data: "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000c180cf67650ac995000000000000000000000000000000000000000000000149000000000000000000000000000000000000000000000000000000000000000000000000000000027b95951c2366ae4d1155214a01a9000cb018c9b69cf23343d4c292feb9126514",
      logIndex: "0x1",
      topics: [
        "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
        "0x3b19a87dc13d7c9165f444bef3044543c132cbd979f062f2459ef3725633a3f4"
      ],
      transactionHash: "0x77033aaa1f445b556265d1f9c13265e433121d76adbd5860143f3f0db3e258f6",
      transactionIndex: "0x1"
    }]
  });
  test({
    label: "log_add_tx",
    msg: [{
      address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
      blockHash: "0x0e2f477418a6cc65306a2559a611cafc22d50505b493a1e3674ad9c8076e15e2",
      blockNumber: "0x11963b",
      data: "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000df8a189bb07bf96c000000000000000000000000000000000000000000000149000000000000000000000000000000000000000000000000000000000000000000000000000000024eef144a1d15da2a6ad96e36147f3fee70e0ecc3a4f0cbb3932fbd7133809f09",
      logIndex: "0x2",
      topics: [
        "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
        "0x3b19a87dc13d7c9165f444bef3044543c132cbd979f062f2459ef3725633a3f4"
      ],
      transactionHash: "0xe0384041bbc3b637fddc2835841b25d14f893e6cf9866032a13e5fd5068e4ab6",
      transactionIndex: "0x2"
    }]
  });
  test({
    label: "log_add_tx",
    msg: [{
      address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
      blockHash: "0x8c3fa0f2a092adf52702b8ebda332c12311f32a9d7dbeca3fd7ad3237a1b143a",
      blockNumber: "0x11964c",
      data: "0x000000000000000000000000ae1ba9370f9c3d64894ed9a101079fd17bf1044800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000001d7dd185ffffff8d00000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000002ccb7a4c7d0c9a0de5c08c459ce78642b23fdbd9df707781a9f4c24f9c1205bfd",
      logIndex: "0x1",
      topics: [
        "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
        "0xbbc704ce88ff685a56a6a8e708cec54f981d750d8fe83a53d8c4ffb2d4bf4ddd"
      ],
      transactionHash: "0xa1796f1e7bd1290ba695908a2633a5164deb83c1431c5106c51fb186e79c257e",
      transactionIndex: "0x3"
    }]
  });
  test({
    label: "log_cancel",
    msg: [{
      address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
      blockHash: "0x171e8b766a39d5922cdeb45f9f4b3ebfba60d98a4a0b5c1e2dd14fb223fcd595",
      blockNumber: "0x11966f",
      data: "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c00000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000010000000000000000c84e2b59c1a8cb678624e582d22e3ac0b4bbed6490900065143bf29b0563e1ee00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002",
      logIndex: "0x0",
      topics: [
        "0x9ecf4903f3efaf1549dc51545bd945f94d51923f37ce198a3b838125a2f397d5",
        "0x467982cbbb0fbb3fc4499f4376aa15795f44a999f32369476f355196f52eeb68"
      ],
      transactionHash: "0xf5a45ffe66c9182545dd6c876d2727dded27ea41369ebee7d1b3c7469e70a99c",
      transactionIndex: "0x2"
    }]
  });
  test({
    label: "marketCreated",
    msg: [{
      address: "0x2e5a882aa53805f1a9da3cf18f73673bca98fa0f",
      topics: [
        "0x8f9d87fc01c4c1a9057249423e7e9c38c4f8899a494502d7aaa64c0b7c40cf9e",
        "0x0000000000000000000000000e52ec96687f8281dae987934f4619d1990ecbde",
        "0xbcec0378dfeeb59908c886aff93b0e820bb579f63acaeb4b3d4004ec01153115",
        "0x726f666c636f7074657200000000000000000000000000000000000000000000"
      ],
      data: "0xebf353dd9fc2f5fb49913414dd192d3c2835291917be735bb22a8c473badeeab000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000003e733628714200000000000000000000000000000000000000000000000000000000000058588fee",
      blockNumber: "0x1ad",
      transactionIndex: "0x0",
      transactionHash: "0x2f83b7150b3061d4364d190fb91b94d4f3343f0ef91366105ca5245ee06e5229",
      blockHash: "0xde4dc83efe62a660c56245b96c5ff884975292e096450d92edf8a9db403d9ca6",
      logIndex: "0x0",
      removed: false
    }]
  });
  test({
    label: "tradingFeeUpdated",
    msg: [{
      address: "0x181ab5cfb79c3a4edd7b4556412b40453edeec32",
      blockHash: "0x5f725f19f6e8d250ebaffdc3e9ce898dfd1c1aca2f33d760015148110df16e25",
      blockNumber: "0x15074b",
      data: "0x000000000000000000000000000000000000000000000000009c51c4521e00000000000000000000000000000000000000000000000000000000000058570e31",
      logIndex: "0x0",
      topics: [
        "0xb8c735cc6495f8dac2581d532413dea78d7e03e0ff0880c32b4648c2145fba41",
        "0x00000000000000000000000005ae1d0ca6206c6168b42efcd1fbe0ed144e821b",
        "0x00000000000000000000000000000000000000000000000000000000000f69b5",
        "0xe7d9beacb528f154ea5bbe325c2497cdb2a208f7fb8460bdf1dbc26e7190775b"
      ],
      transactionHash: "0xdd394f14b92162c5b29011512513fff0188c5cff9b4d0d453b40175db6f9e868",
      transactionIndex: "0x0"
    }]
  });
  test({
    label: "log_fill_tx",
    msg: [{
      address: "0x13cef2d86d4024f102e480627239359b5cb7bf52",
      blockHash: "0x8171815b23ee1e0cf62e331f283c6d977689a93e3574b2ca35f75c19804914ef",
      blockNumber: "0x11941e",
      data: "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000de0b6b3a7640000640ce61af3b560a54f2f41dcba10ef6337df02e650c30f651789a090b02c312f0000000000000000000000000000000000000000000000000000000000000001",
      logIndex: "0x0",
      topics: [
        "0x715b9a9cb6dfb4fa9cb1ebc2eba40d2a7bd66aa8cef75f87a77d1ff05d29a3b6",
        "0xebb0d4c04bc87d3b401a5baad3b093a5e7cc3f4e996dc53e36db78c8b374cc9a",
        "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c",
        "0x00000000000000000000000015f6400a88fb320822b689607d425272bea2175f"
      ],
      transactionHash: "0xf9d3dd428f4d27c6ee14c6a08d877f777bc0365d29fad06ddc0f9dce11dbb9ce",
      transactionIndex: "0x0"
    }]
  });
  test({
    label: "log_fill_tx",
    msg: [{
      address: "0x13cef2d86d4024f102e480627239359b5cb7bf52",
      blockHash: "0x0a383bf904a7156d840dbf7ebd0b30ff79dce4950dfa4b5b80bdb619070085d1",
      blockNumber: "0x11964b",
      data: "0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000001d7dd185ffffff8d0000000000000000000000000000000000000000000000001d7dd185ffffff8d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002",
      logIndex: "0x1",
      topics: [
        "0x715b9a9cb6dfb4fa9cb1ebc2eba40d2a7bd66aa8cef75f87a77d1ff05d29a3b6",
        "0xbbc704ce88ff685a56a6a8e708cec54f981d750d8fe83a53d8c4ffb2d4bf4ddd",
        "0x000000000000000000000000ae1ba9370f9c3d64894ed9a101079fd17bf10448",
        "0x000000000000000000000000dfb3458ad28f9ce1a6405e8c85daa8c8bdefb24b"
      ],
      transactionHash: "0x6becec25bcb68824ad1904ed3424bdd056055413b96a4195b803c7a1b32b6c1e",
      transactionIndex: "0x2"
    }]
  });
  test({
    label: "withdraw",
    msg: [{
      address: "0xa34c9f6fc047cea795f69b34a063d32e6cb6288c",
      topics: [
        "0x44b6aeb7b38bb1ad04b4d0daf588cff086ff8829f0a34c30ddbb4d38695428de",
        "0x000000000000000000000000189d2692d3050fe77543a099105af20d14ccc697"
      ],
      data: "0x00000000000000000000000000000000000000000000000000000000585769b7",
      blockNumber: "0x12c",
      transactionIndex: "0x0",
      transactionHash: "0xaacffeb38e31e4e8ff5c5da0a6bbf07c2e4c253cb84be14781d57a8aab763b31",
      blockHash: "0xb897e8ec0d06fb504e9b7e5ab876ad59d725f63ed9c0271bd990c2e807371e58",
      logIndex: "0x0",
      removed: false
    }]
  });
  test({
    label: "penalize",
    msg: [{
      "address": "0xc1c4e2f32e4b84a60b8b7983b6356af4269aab79",
      "topics": [
        "0xa865e521626cec7891279a54f112b20abe52888a42df585b51ca9ff03c4249b7",
        "0x0000000000000000000000001c3cd4cf3aa7ab6d4d717a52344dc4d71dcc5567",
        "0x5a03af1995e0095e90111e6e601f86e49948180fd047a053b067ff5ab313ec75"
      ],
      "data": "0x00000000000000000000000000000000000000000000000014d1120d7b1600000000000000000000000000000000000000000000000000028c418afbbb5c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028c418afbbb5c00000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000014d1120d7b16000000000000000000000000000000000000000000000000000000000000004b63b8000000000000000000000000000000000000000000000000000000005858de26",
      "blockNumber": "0xaed",
      "transactionIndex": "0x0",
      "transactionHash": "0x6192161af58cdf7411c4471362827c8846ebba673a928ecfdfcc9a7a3e21fce0",
      "blockHash": "0x0cb062897c8fc7549f1a095a6ae9f58171b94385582bef67139204a693d04d3f",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "penalize",
    msg: [{
      "address": "0xc1c4e2f32e4b84a60b8b7983b6356af4269aab79",
      "topics": [
        "0xa865e521626cec7891279a54f112b20abe52888a42df585b51ca9ff03c4249b7",
        "0x0000000000000000000000001c3cd4cf3aa7ab6d4d717a52344dc4d71dcc5567",
        "0xcf2d04f9d326f491a519e7785c42e3c767ee185d32e47237b525ad3dd49d360e"
      ],
      "data": "0x00000000000000000000000000000000000000000000000002501e734690aaab0000000000000000000000000000000000000000000000028c418afbbb5c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028c418afbbb5c00000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000002501e734690aaab00000000000000000000000000000000000000000000000000000000004b63b8000000000000000000000000000000000000000000000000000000005858de40",
      "blockNumber": "0xaf1",
      "transactionIndex": "0x0",
      "transactionHash": "0x38a15d798915cae7a5282affb4bc409506e45eef8d41c0e0c5f5ef5b2983bd88",
      "blockHash": "0x610764d7e2675f8cb2198552021d42d132dadbc2da89c07762e6286f4ebbad92",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "penalize",
    msg: [{
      "address": "0xc1c4e2f32e4b84a60b8b7983b6356af4269aab79",
      "topics": [
        "0xa865e521626cec7891279a54f112b20abe52888a42df585b51ca9ff03c4249b7",
        "0x0000000000000000000000001c3cd4cf3aa7ab6d4d717a52344dc4d71dcc5567",
        "0x30b7453190210c4f7747f9602d02c93dece6ddfcf0e20ceec5dae452da6c82a9"
      ],
      "data": "0x000000000000000000000000000000000000000000000000047f14488b3a00000000000000000000000000000000000000000000000000028c418afbbb5c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028c418afbbb5c00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000047f14488b3a000000000000000000000000000000000000000000000000000000000000004b63b8000000000000000000000000000000000000000000000000000000005858de57",
      "blockNumber": "0xaf5",
      "transactionIndex": "0x0",
      "transactionHash": "0x73666e685c10e5cdf20ddcbcb4f882fd198ae3cf91c25d4c5c2a90c4fbbb2bc5",
      "blockHash": "0xe40f9ecf398d9c54d9d7eb5c66d3173ae13812744c72f033779224ca26390db5",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "collectedFees",
    msg: [{
      "address": "0x46e690f00623b3eaf033bff914d9e7166c3de5df",
      "topics": [
        "0xc81e036aceff1b9ec18111ca6754e12887ad248f60557e154c5ba9a383c24c69",
        "0x0eb62072ffe00c9dd80f6528a92f4191f06008e7795ac4b0b0ee0850d4817ef8",
        "0x0000000000000000000000001c3cd4cf3aa7ab6d4d717a52344dc4d71dcc5567"
      ],
      "data": "0x00000000000000000000000000000000000000000000000176b344f2a78c000000000000000000000000000000000000000000000000021f937e209084a10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028c418afbbb5c00000000000000000000000000000000000000000000000000028c418afbbb5c0000000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000004b63b8000000000000000000000000000000000000000000000000000000005858de97",
      "blockNumber": "0xafd",
      "transactionIndex": "0x0",
      "transactionHash": "0x5aa2c20cf407abdb88cc86c8b00d4d0c996274abb036d6f699bf29ef281a74fc",
      "blockHash": "0x98aec21ee32a7ea0361c8b907c6111b98cddf62a7d57a7558c9252cdf3041d5b",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "submittedReportHash",
    msg: [{
      "address": "0x8c19616de17acdfbc933b99d9f529a689d22098f",
      "topics": [
        "0xe8f8544e3319f0811318e4fe055fcfbda248abaea92c463457e881c872e0faa0",
        "0x000000000000000000000000df398ee94e757de21d31d7a819e64434ec4257a2",
        "0xf20811cc25947e2966935d16a47f01ddf0618df6de57f7d2e74a016f5a7a0867"
      ],
      "data": "0x22be52e50dc4e77259333e90705126ce934968f0ddaa85794e3c164462f3005c6385ba27cf121838f38d81f7b50df29b3a954230cac6ec8f842bab027fa4b05fbccf16533d8df0b702668378f7a22bb84c8c8b78c563ec3ef50a4ce1e63903c10000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000005858e545",
      "blockNumber": "0xc47",
      "transactionIndex": "0x0",
      "transactionHash": "0xe2b2b742cd8d254beff27dc975cb0809a6a2cbc4df0076b0d1064dd2808a258b",
      "blockHash": "0x8eb135d9c9ccbb7e39a419f6214bf51a6986fff1dc09c05118f5ea315a69bf26",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "submittedReportHash",
    msg: [{
      "address": "0x8c19616de17acdfbc933b99d9f529a689d22098f",
      "topics": [
        "0xe8f8544e3319f0811318e4fe055fcfbda248abaea92c463457e881c872e0faa0",
        "0x000000000000000000000000df398ee94e757de21d31d7a819e64434ec4257a2",
        "0xf20811cc25947e2966935d16a47f01ddf0618df6de57f7d2e74a016f5a7a0867"
      ],
      "data": "0x22be52e50dc4e77259333e90705126ce934968f0ddaa85794e3c164462f3005c6385ba27cf121838f38d81f7b50df29b3a954230cac6ec8f842bab027fa4b05fbccf16533d8df0b702668378f7a22bb84c8c8b78c563ec3ef50a4ce1e63903c10000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000005858e549",
      "blockNumber": "0xc48",
      "transactionIndex": "0x0",
      "transactionHash": "0x530f8ff43518fff42b3e173de70fb88013d3d169c7373114c095a58d294a5d90",
      "blockHash": "0xfcae2cedbf878c0bcf019ba6ff1422761af0e9002bb68bc78c5e425d629c4fed",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "submittedReportHash",
    msg: [{
      "address": "0x8c19616de17acdfbc933b99d9f529a689d22098f",
      "topics": [
        "0xe8f8544e3319f0811318e4fe055fcfbda248abaea92c463457e881c872e0faa0",
        "0x000000000000000000000000df398ee94e757de21d31d7a819e64434ec4257a2",
        "0xf38c713303ed188b123c37a7f31bcc3c9ea0fa3dbbdb46dc6da79d2c51eae2ad"
      ],
      "data": "0x4a81d0b7bef0eabffd1c904e8666ddb62d4febc2ef4200fc8085032918b9dcde746fc58b84aa96f273d9e734cb61b957b36ea835f866172507f513b8633a2b80bb3cea50f196da8f332c40a94b293a15b3e3698e9a4889de66b5f334c91aceef0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000005858e54f",
      "blockNumber": "0xc49",
      "transactionIndex": "0x0",
      "transactionHash": "0x8638f5221c95617e95070856283175c31de3dd9bf3092300a66c98e388e25dfb",
      "blockHash": "0xe57d5b1ec3cb1b8e956a0c9f6d8f083356feca2413431817be53408db056100c",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "submittedReport",
    msg: [{
      "address": "0x8c19616de17acdfbc933b99d9f529a689d22098f",
      "topics": [
        "0xa6947592b50b1143536435c37404960f6cd671bba88e5132eaab5e4b3b2c86eb",
        "0x000000000000000000000000df398ee94e757de21d31d7a819e64434ec4257a2",
        "0xf38c713303ed188b123c37a7f31bcc3c9ea0fa3dbbdb46dc6da79d2c51eae2ad"
      ],
      "data": "0x011f72dfb854a74a2c85ea5fe663616482fb25b8f6f2a515b2232e474fdc87d20000000000000000000000000000000000000000000000000484fa0b698dc0000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000005858e5af",
      "blockNumber": "0xc6f",
      "transactionIndex": "0x0",
      "transactionHash": "0x77d19403eb22ede15908ba52b0469b38cc3b7a246c96db45bd5e93511edeb301",
      "blockHash": "0xbc404e757da44440ebc3f9d89276abe38bd0619948a79a5477f7139a6a6d74c7",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "submittedReport",
    msg: [{
      "address": "0x8c19616de17acdfbc933b99d9f529a689d22098f",
      "topics": [
        "0xa6947592b50b1143536435c37404960f6cd671bba88e5132eaab5e4b3b2c86eb",
        "0x000000000000000000000000df398ee94e757de21d31d7a819e64434ec4257a2",
        "0xa1a983c4fd8fd17fb5b925005f6d739a7188ecfb2e55d45e4cb997355f957d55"
      ],
      "data": "0x839ae9c8b6949e1558348833da3a15256e65b2ba29773ca2ea791514f697ca7200000000000000000000000000000000000000000000000006f05b59d3b200010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005858e5ad",
      "blockNumber": "0xc6d",
      "transactionIndex": "0x0",
      "transactionHash": "0x46b739fc9162178307dc5616fa5e0e9b327857f9fe7c803ada1f01d27bc8471a",
      "blockHash": "0xb3964a476997807613fe10bf1ee0aca4c3aa93bc80657a96364d2f23a3a9a0d7",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "submittedReport",
    msg: [{
      "address": "0x8c19616de17acdfbc933b99d9f529a689d22098f",
      "topics": [
        "0xa6947592b50b1143536435c37404960f6cd671bba88e5132eaab5e4b3b2c86eb",
        "0x000000000000000000000000df398ee94e757de21d31d7a819e64434ec4257a2",
        "0xf20811cc25947e2966935d16a47f01ddf0618df6de57f7d2e74a016f5a7a0867"
      ],
      "data": "0x06ec8edc744f8d721dcf298e5ae870c97d94c74ea9d9c0f5219c919260ff4afc00000000000000000000000000000000000000000000000014d1120d7b1600000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000005858e5a6",
      "blockNumber": "0xc6a",
      "transactionIndex": "0x0",
      "transactionHash": "0x468005e4f10c379ad4583d94c99b1aa528443ebaded731e09e3ca57ed0f474ff",
      "blockHash": "0xa53c056263a2b1c745797cacd76be82571b080c00a1a1fa2c56cb0af9134176f",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "payout",
    msg: [{
      "address": "0x52ccb0490bc81a2ae363fccbb2b367bca546cec7",
      "topics": [
        "0xa2bf9dad859f137c8894b41a4e89182a27fa82c48ed42019e924af83fefc1f81",
        "0x000000000000000000000000d21aa876fe86b0a87f5b6df773d782e1f9bd04df",
        "0x2d188fb421d31f83588166fa468fa586fb26d4aa9109e94d27f634dfd8ea9996"
      ],
      "data": "0x0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000021e1bda8d65207980000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000585e0748",
      "blockNumber": "0x228",
      "transactionIndex": "0x0",
      "transactionHash": "0xdf7f0d87052df1aea3c1ea070cb397c19592624498a33c56f9ca32a34b64ea6b",
      "blockHash": "0x4c9931dd6f0a87dfa921bd21b32c3d35f99dfcb9a318231d550062cab905f0c7",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "payout",
    msg: [{
      "address": "0x52ccb0490bc81a2ae363fccbb2b367bca546cec7",
      "topics": [
        "0xa2bf9dad859f137c8894b41a4e89182a27fa82c48ed42019e924af83fefc1f81",
        "0x000000000000000000000000d21aa876fe86b0a87f5b6df773d782e1f9bd04df",
        "0x2d188fb421d31f83588166fa468fa586fb26d4aa9109e94d27f634dfd8ea9996"
      ],
      "data": "0x0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000021e1bda8d65207980000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000585e0748",
      "blockNumber": "0x228",
      "transactionIndex": "0x0",
      "transactionHash": "0xdf7f0d87052df1aea3c1ea070cb397c19592624498a33c56f9ca32a34b64ea6b",
      "blockHash": "0x4c9931dd6f0a87dfa921bd21b32c3d35f99dfcb9a318231d550062cab905f0c7",
      "logIndex": "0x0",
      "removed": false
    }]
  });
  test({
    label: "payout",
    msg: [{
      "address": "0x52ccb0490bc81a2ae363fccbb2b367bca546cec7",
      "topics": [
        "0xa2bf9dad859f137c8894b41a4e89182a27fa82c48ed42019e924af83fefc1f81",
        "0x000000000000000000000000d21aa876fe86b0a87f5b6df773d782e1f9bd04df",
        "0x91a0f3cfb3834980593065f33b7e53e4b97a95ba25a1132f152f94baa6df8b62"
      ],
      "data": "0x00000000000000000000000000000000000000000000000006f05b59d3b2000000000000000000000000000000000000000000000000021f99bcd92e298e000000000000000000000000000000000000000000000000000006f05b59d3b2000000000000000000000000000000000000000000000000000000000000585e074d",
      "blockNumber": "0x22a",
      "transactionIndex": "0x0",
      "transactionHash": "0x4d220ec50b26c7b666583249cf00ca2d5be103c0281a6ee1835877000240f907",
      "blockHash": "0x31fa26fe8e496bfd80f5754f811d046f830795c714d1682887907d5a65f8367b",
      "logIndex": "0x0",
      "removed": false
    }]
  });
});
describe("poll_filter", function() {
  // 4 tests total
  var getFilterChanges = augur.rpc.getFilterChanges;
  var parse_event_message = augur.filters.parse_event_message;
  var parse_block_message = augur.filters.parse_block_message;
  var parse_contracts_message = augur.filters.parse_contracts_message;
  afterEach(function() {
    augur.rpc.getFilterChanges = getFilterChanges;
    augur.filters.parse_event_message = parse_event_message;
    augur.filters.parse_block_message = parse_block_message;
    augur.filters.parse_contracts_message = parse_contracts_message;
  });
  var test = function(t) {
    it(JSON.stringify(t), function() {
      augur.rpc.getFilterChanges = t.getFilterChanges;
      augur.filters.parse_event_message = t.assertions;
      augur.filters.parse_block_message = t.assertions;
      augur.filters.parse_contracts_message = t.assertions;
      // set the id, we do this because otherwise they would all be null as that's the default state.
      if (augur.filters.filter[t.label]) augur.filters.filter[t.label].id = t.id;

      augur.filters.poll_filter(t.label, t.onMessage);

      // reset the id to the default null state.
      if (augur.filters.filter[t.label]) augur.filters.filter[t.label].id = null;
    });
  };
  test({
    label: 'unrecognized label',
    onMessage: function(msg) {
    },
    getFilterChanges: function(filterID, cb) {
      // in this case we should just exit the function if it's not recognized label and never hit this assertion.
      assert.isTrue(false, 'Should not call augur.rpc.getFilterChanges if the label passed is not recognized');
    }
  });
  test({
    label: 'withdraw',
    id: '0x1',
    onMessage: utils.noop,
    assertions: function(label, msg, cb) {
      assert.deepEqual(label, 'withdraw');
      assert.deepEqual(msg, { value: '10', to: '0x0000000000000000000000000000000000000001'});
      assert.deepEqual(cb, utils.noop);
    },
    getFilterChanges: function(filterID, cb) {
        assert.deepEqual(filterID, '0x1');
        assert.isFunction(cb);
        // convert CB to string to confirm we created the correct callback and it contains the expected call within it.
        assert.include(cb.toString(), 'self.parse_event_message');
        cb({ value: '10', to: '0x0000000000000000000000000000000000000001'}, cb);
    }
  });
  test({
    label: 'contracts',
    id: '0x2',
    onMessage: utils.noop,
    assertions: function(msg, onMessage) {
      assert.deepEqual(msg, { data: ['0x1', '0x2']});
      assert.deepEqual(onMessage, utils.noop);
    },
    getFilterChanges: function(filterID, cb) {
        assert.deepEqual(filterID, '0x2');
        assert.isFunction(cb);
        // convert CB to string to confirm we created the correct callback and it contains the expected call within it.
        assert.include(cb.toString(), 'self.parse_contracts_message');
        cb({ data: ['0x1', '0x2']}, cb);
    }
  });
  test({
    label: 'block',
    id: '0x3',
    onMessage: utils.noop,
    assertions: function(msg, onMessage) {
      assert.deepEqual(msg, '0x11941a');
      assert.deepEqual(onMessage, utils.noop);
    },
    getFilterChanges: function(filterID, cb) {
        assert.deepEqual(filterID, '0x3');
        assert.isFunction(cb);
        // convert CB to string to confirm we created the correct callback and it contains the expected call within it.
        assert.include(cb.toString(), 'self.parse_block_message');
        cb('0x11941a', cb);
    }
  });
});
describe("clear_filter", function() {
  // 2 tests total
  var unsubscribe = augur.filters.unsubscribe;
  afterEach(function() {
    augur.filters.unsubscribe = unsubscribe;
  });
  var test = function(t) {
    it(JSON.stringify(t) + 'sync', function() {
      if (augur.filters.filter[t.label]) augur.filters.filter[t.label].id = t.id;

      augur.filters.unsubscribe = t.unsubscribe;

      t.assertions(augur.filters.clear_filter(t.label, undefined));
    });
    it(JSON.stringify(t) + 'async', function(done) {
      if (augur.filters.filter[t.label]) augur.filters.filter[t.label].id = t.id;

      augur.filters.unsubscribe = t.unsubscribe;

      augur.filters.clear_filter(t.label, function(out) {
        t.assertions(out);
        done();
      });
    });
  };
  test({
    label: 'withdraw',
    id: '0x1',
    unsubscribe: function(id, cb) {
      assert.deepEqual(id, '0x1');
      if(utils.is_function(cb)) return cb('1');
      return '1';
    },
    assertions: function(out) {
      assert.deepEqual(out, '1');
      assert.isNull(augur.filters.filter['withdraw'].id);
    }
  });
});
describe("setup_event_filter", function() {
  // 1 test total
  var subscribeLogs = augur.filters.subscribeLogs;
  afterEach(function() {
    augur.filters.subscribeLogs = subscribeLogs;
  });
  var test = function(t) {
    it(JSON.stringify(t), function() {
      augur.filters.subscribeLogs = t.subscribeLogs;
      t.assertions(augur.filters.setup_event_filter(t.contract, t.label, t.f));
    });
  };
  test({
    contract: 'Cash',
    label: 'deposit',
    f: utils.noop,
    subscribeLogs: function(params, cb) {
      assert.deepEqual(params, {
        address: augur.contracts.Cash,
        topics: [augur.api.events.deposit.signature]
      });
      assert.deepEqual(cb, utils.noop);
      // return a filter_id
      return '0x1';
    },
    assertions: function(filter_id) {
      assert.deepEqual(filter_id, '0x1');
    }
  });
});
describe("setup_contracts_filter", function() {
  // 2 tests total
  var subscribeLogs = augur.filters.subscribeLogs;
  var contracts = augur.contracts;
  afterEach(function() {
    augur.filters.subscribeLogs = subscribeLogs;
    augur.filters.filter.contracts = { id: null, heartbeat: null };
    augur.contracts = contracts;
  });
  var test = function(t) {
    it(JSON.stringify(t) + 'sync', function() {
      augur.filters.subscribeLogs = t.subscribeLogs;
      augur.contracts = t.contracts;

      t.assertions(augur.filters.setup_contracts_filter(undefined));
    });
    it(JSON.stringify(t) + 'async', function(done) {
      augur.filters.subscribeLogs = t.subscribeLogs;
      augur.contracts = t.contracts;

      augur.filters.setup_contracts_filter(function(contracts) {
        t.assertions(contracts);
        done();
      });
    });
  };
  test({
    contracts: {
      test: '0x7982b951d4da29981a2fec08d4b659e64ecf1ca2',
      example: '0xe2cd11a739009f4ee336a747dc58222d8f125de2',
      hello: '0x3854ae028c91939a5d9b2a4614e4f8471259aa43',
      world: '0x1aaae11d6aab155657faa880dcc1892c4f49f245'
    },
    subscribeLogs: function(params, cb) {
      assert.deepEqual(params, {
        address: [
          '0x7982b951d4da29981a2fec08d4b659e64ecf1ca2', '0xe2cd11a739009f4ee336a747dc58222d8f125de2', '0x3854ae028c91939a5d9b2a4614e4f8471259aa43', '0x1aaae11d6aab155657faa880dcc1892c4f49f245'
        ],
        fromBlock: "0x01",
        toBlock: "latest"
      });
      if(utils.is_function(cb)) return cb('0x1');
      return '0x1';
    },
    assertions: function(contracts) {
      assert.deepEqual(contracts, {
        id: '0x1',
        heartbeat: null
      });
    }
  });
});
describe("setup_block_filter", function() {
  // 2 tests total
  var subscribeNewBlocks = augur.filters.subscribeNewBlocks;
  afterEach(function() {
    augur.filters.subscribeNewBlocks = subscribeNewBlocks;
    augur.filters.filter.block = { id: null, heartbeat: null };
  });
  var test = function(t) {
    it(JSON.stringify(t) + 'sync', function() {
      augur.filters.subscribeNewBlocks = t.subscribeNewBlocks;

      t.assertions(augur.filters.setup_block_filter(undefined));
    });
    it(JSON.stringify(t) + 'async', function(done) {
      augur.filters.subscribeNewBlocks = t.subscribeNewBlocks;

      augur.filters.setup_block_filter(function(block) {
        t.assertions(block);
        done();
      });
    });
  };
  test({
    subscribeNewBlocks: function(cb) {
      if(cb && utils.is_function(cb)) return cb('0x1');
      return '0x1';
    },
    assertions: function(contracts) {
      assert.deepEqual(contracts, {
        id: '0x1',
        heartbeat: null
      });
    }
  });
});
describe("start_event_listener", function() {
  // 10 tests total
  var setup_event_filter = augur.filters.setup_event_filter;
  var filter = augur.filters.filter;
  afterEach(function() {
    augur.filters.setup_event_filter = setup_event_filter;
    // make sure filter is completely nulled out before we start a new test.
    for (var label in filter) {
      if (filter.hasOwnProperty(label)) {
        filter[label] = { id: null, heartbeat: null };
      }
    }
    augur.filters.filter = filter;
  });
  var test = function(t) {
    it(JSON.stringify(t) + 'async', function(done) {
      augur.filters.setup_event_filter = t.setup_event_filter;
      augur.filters.filter = t.filter || filter;

      augur.filters.start_event_listener(t.label, function(filterID) {
        t.assertions(filterID);
        done()
      });
    });
    it(JSON.stringify(t) + 'sync', function() {
      augur.filters.setup_event_filter = t.setup_event_filter;
      augur.filters.filter = t.filter || filter;

      t.assertions(augur.filters.start_event_listener(t.label, undefined));
    })
  };
  test({
    label: 'withdraw',
    filter: { 'withdraw': { id: '0x1', heartbeat: null } },
    setup_event_filter: function(contract, label, cb) {
      // shouldnt get hit
      assert.isTrue(false, 'setup_event_filter called when it should not have been!');
    },
    assertions: function(filterID) {
      assert.deepEqual(filterID, '0x1');
    }
  });
  test({
    label: 'withdraw',
    setup_event_filter: function(contract, label, cb) {
      assert.deepEqual(contract, 'Cash');
      assert.deepEqual(label, 'withdraw');
      if (utils.is_function(cb)) return cb('0x1');
      return '0x1';
    },
    assertions: function(filterID) {
      assert.deepEqual(filterID, '0x1');
      assert.deepEqual(augur.filters.filter.withdraw, {
      	id: '0x1',
      	heartbeat: null
      });
    }
  });
  test({
    label: 'tradingFeeUpdated',
    setup_event_filter: function(contract, label, cb) {
      assert.deepEqual(contract, 'CreateMarket');
      assert.deepEqual(label, 'tradingFeeUpdated');
      if (utils.is_function(cb)) return cb(undefined);
      return undefined;
    },
    assertions: function(filterID) {
      assert.deepEqual(filterID, augur.errors.FILTER_NOT_CREATED);
      assert.deepEqual(augur.filters.filter.tradingFeeUpdated, {
      	id: null,
      	heartbeat: null
      });
    }
  });
  test({
    label: 'trade_logReturn',
    setup_event_filter: function(contract, label, cb) {
      assert.deepEqual(contract, 'Trade');
      assert.deepEqual(label, 'trade_logReturn');
      if (utils.is_function(cb)) return cb('0x');
      return '0x';
    },
    assertions: function(filterID) {
      assert.deepEqual(filterID, augur.errors.FILTER_NOT_CREATED);
      assert.deepEqual(augur.filters.filter.trade_logReturn, {
      	id: null,
      	heartbeat: null
      });
    }
  });
  test({
    label: 'payout',
    setup_event_filter: function(contract, label, cb) {
      assert.deepEqual(contract, 'Payout');
      assert.deepEqual(label, 'payout');
      if (cb && utils.is_function(cb)) return cb({ error: -1, message: "sender doesn't exist / match up with the participant given participant number" });
      return { error: -1, message: "sender doesn't exist / match up with the participant given participant number" };
    },
    assertions: function(filterID) {
      assert.deepEqual(filterID, { error: -1, message: "sender doesn't exist / match up with the participant given participant number" });
      assert.deepEqual(augur.filters.filter.payout, {
      	id: null,
      	heartbeat: null
      });
    }
  });
});
describe("start_contracts_listener", function() {
  // 2 tests total
  var setup_contracts_filter = augur.filters.setup_contracts_filter;
  afterEach(function() {
    augur.filters.filter.contracts = { id: null, heartbeat: null };
    augur.filters.setup_contracts_filter = setup_contracts_filter;
  });
  var test = function(t) {
    it(JSON.stringify(t) + ' sync', function() {
      augur.filters.setup_contracts_filter = t.setup_contracts_filter;

      t.assertions(augur.filters.start_contracts_listener(undefined));
    });
    it(JSON.stringify(t) + ' async', function(done) {
      augur.filters.setup_contracts_filter = t.setup_contracts_filter;

      augur.filters.start_contracts_listener(function(contracts) {
        t.assertions(contracts);
        done();
      });
    });
  };
  test({
    setup_contracts_filter: function(cb) {
      augur.filters.filter.contracts = { id: '0x123', heartbeat: null };
      if (!utils.is_function(cb)) return { id: '0x123', heartbeat: null };
      return cb({ id: '0x123', heartbeat: null });
    },
    assertions: function(contracts) {
      assert.deepEqual(contracts, { id: '0x123', heartbeat: null });
      assert.deepEqual(augur.filters.filter.contracts, contracts);
    }
  });
});
describe("start_block_listener", function() {
  // 2 tests total
  var setup_block_filter = augur.filters.setup_block_filter;
  afterEach(function() {
    augur.filters.filter.block = { id: null, heartbeat: null };
    augur.filters.setup_block_filter = setup_block_filter;
  });
  var test = function(t) {
    it(JSON.stringify(t) + ' sync', function() {
      augur.filters.setup_block_filter = t.setup_block_filter;

      t.assertions(augur.filters.start_block_listener(undefined));
    });
    it(JSON.stringify(t) + ' async', function(done) {
      augur.filters.setup_block_filter = t.setup_block_filter;

      augur.filters.start_block_listener(function(block) {
        t.assertions(block);
        done();
      });
    });
  };
  test({
    setup_block_filter: function(cb) {
      augur.filters.filter.block = { id: '0xabc', heartbeat: null };
      if (!utils.is_function(cb)) return { id: '0xabc', heartbeat: null };
      return cb({ id: '0xabc', heartbeat: null });
    },
    assertions: function(block) {
      assert.deepEqual(block, { id: '0xabc', heartbeat: null });
      assert.deepEqual(augur.filters.filter.block, block);
    }
  });
});
describe("pacemaker", function() {
  // 6 tests total
  var filter = augur.filters.filter;
  var rpc = augur.rpc;
  var poll_filter = augur.filters.poll_filter;
  var parse_contracts_message = augur.filters.parse_contracts_message;
  var parse_block_message = augur.filters.parse_block_message;
  var parse_event_message = augur.filters.parse_event_message;
  var finished;
  afterEach(function() {
    augur.filters.filter = filter;
    augur.rpc = rpc;
    augur.filters.poll_filter = poll_filter;
    augur.filters.parse_contracts_message = parse_contracts_message;
    augur.filters.parse_block_message = parse_block_message;
    augur.filters.parse_event_message = parse_event_message;
  });
  var test = function(t) {
    it(JSON.stringify(t), function(done) {
      finished = done;
      augur.filters.filter = t.filter;
      augur.filters.poll_filter = t.poll_filter || poll_filter;
      augur.rpc = t.rpc;
      augur.subscriptionsSupported = t.subscriptionsSupported;
      augur.filters.parse_contracts_message = t.parse_contracts_message;
      augur.filters.parse_block_message = t.parse_block_message;
      augur.filters.parse_event_message = t.parse_event_message;
      augur.filters.pacemaker(t.cb);
      t.assertions();
    });
  };
  test({
    cb: undefined,
    subscriptionsSupported: false,
    rpc: { },
    filter: {
    	block: {
    		id: null,
    		heartbeat: null
    	},
    	contracts: {
    		id: null,
    		heartbeat: null
    	},
    	testEvent: {
    		id: null,
    		heartbeat: null
    	}
    },
    assertions: function() {
      assert.deepEqual(augur.filters.filter, {
      	block: {
      		id: null,
      		heartbeat: null
      	},
      	contracts: {
      		id: null,
      		heartbeat: null
      	},
      	testEvent: {
      		id: null,
      		heartbeat: null
      	}
      });
      finished();
    }
  });
  test({
    cb: '',
    subscriptionsSupported: false,
    rpc: { },
    filter: {
    	block: {
    		id: null,
    		heartbeat: null
    	},
    	contracts: {
    		id: null,
    		heartbeat: null
    	},
    	testEvent: {
    		id: null,
    		heartbeat: null
    	}
    },
    assertions: function() {
      assert.deepEqual(augur.filters.filter, {
      	block: {
      		id: null,
      		heartbeat: null
      	},
      	contracts: {
      		id: null,
      		heartbeat: null
      	},
      	testEvent: {
      		id: null,
      		heartbeat: null
      	}
      });
      finished();
    }
  });
  test({
    cb: { testEvent: utils.noop },
    subscriptionsSupported: false,
    rpc: { },
    filter: {
    	block: {
    		id: null,
    		heartbeat: null
    	},
    	contracts: {
    		id: null,
    		heartbeat: null
    	},
    	testEvent: {
    		id: null,
    		heartbeat: null
    	}
    },
    poll_filter: function(label, cb) {
      assert.deepEqual(label, 'testEvent');
      assert.deepEqual(cb, utils.noop);
    },
    assertions: function() {
      assert.deepEqual(augur.filters.filter.block, {
      	id: null,
      	heartbeat: null
      });
      assert.deepEqual(augur.filters.filter.contracts, {
      	id: null,
      	heartbeat: null
      });
      assert.isNull(augur.filters.filter.testEvent.id);
      // if repeat is an integer then we are probably in node 7+ and we need to check _onTimeout.
      if (parseInt(augur.filters.filter.testEvent.heartbeat._repeat)) {
        assert.include(augur.filters.filter.testEvent.heartbeat._onTimeout.toString(), 'self.poll_filter');
        // call the interval function to confirm that it was set properly.
        augur.filters.filter.testEvent.heartbeat._onTimeout();
      } else {
        // _repeat isn't a number so it must be node < 7 so _repeat is the function that is called instead of _onTimeout().
        assert.include(augur.filters.filter.testEvent.heartbeat._repeat.toString(), 'self.poll_filter');
        // call the interval function to confirm that it was set properly.
        augur.filters.filter.testEvent.heartbeat._repeat();
      }


      // clean up the inerval and clear out the heartbeat competely.
      clearInterval(augur.filters.filter.testEvent.heartbeat);
      augur.filters.filter.testEvent.heartbeat = null;
      // make sure we cleaned up
      assert.deepEqual(augur.filters.filter.testEvent, { id: null, heartbeat: null });
      // complete test.
      finished();
    }
  });
  test({
    cb: { testEvent: utils.noop },
    subscriptionsSupported: true,
    rpc: {
      subscriptions: {},
    	registerSubscriptionCallback: function(filterID, cb) {
        assert.deepEqual(filterID, '0xe1');
        // in this case 'this' refers to our test rpc obj.
        this.subscriptions[filterID] = cb;
    	}
    },
    filter: {
      block: {
        id: '0xb1',
        heartbeat: null
      },
      contracts: {
        id: '0xc1',
        heartbeat: null
      },
      testEvent: {
        id: '0xe1',
        heartbeat: null
      }
    },
    parse_event_message(label, msg, callback) {
      assert.deepEqual(label, 'testEvent');
      assert.deepEqual(msg, 'short string to be the msg for this simple test');
      assert.deepEqual(callback, utils.noop);
    },
    assertions: function() {
      assert.deepEqual(augur.filters.filter.block, {
        id: '0xb1',
        heartbeat: null
      });
      assert.deepEqual(augur.filters.filter.contracts, {
        id: '0xc1',
        heartbeat: null
      });
      assert.deepEqual(augur.filters.filter.testEvent, {
      	id: '0xe1',
      	heartbeat: null
      });
      // confirm that augur.rpc.subscriptions.0xe1 was set to the correct function.
      assert.include(augur.rpc.subscriptions['0xe1'].toString(), 'self.parse_event_message');
      // call the function attached to our rpc subscriptions object with a msg, in this case a simple string since it isn't in the scope of this unit test.
      augur.rpc.subscriptions['0xe1']('short string to be the msg for this simple test');

      finished();
    }
  });
  test({
    cb: { contracts: utils.noop },
    subscriptionsSupported: true,
    rpc: {
      subscriptions: {},
    	registerSubscriptionCallback: function(filterID, cb) {
        assert.deepEqual(filterID, '0xc1');
        // in this case 'this' refers to our test rpc obj.
        this.subscriptions[filterID] = cb;
    	}
    },
    filter: {
      block: {
        id: '0xb1',
        heartbeat: null
      },
      contracts: {
        id: '0xc1',
        heartbeat: null
      },
      testEvent: {
        id: '0xe1',
        heartbeat: null
      }
    },
    parse_contracts_message(msg, callback) {
      assert.deepEqual(msg, 'short string to be the msg for this simple test');
      assert.deepEqual(callback, utils.noop);
    },
    assertions: function() {
      assert.deepEqual(augur.filters.filter.block, {
        id: '0xb1',
        heartbeat: null
      });
      assert.deepEqual(augur.filters.filter.contracts, {
        id: '0xc1',
        heartbeat: null
      });
      assert.deepEqual(augur.filters.filter.testEvent, {
      	id: '0xe1',
      	heartbeat: null
      });
      // confirm that augur.rpc.subscriptions.0xc1 was set to the correct function.
      assert.include(augur.rpc.subscriptions['0xc1'].toString(), 'self.parse_contracts_message');
      // call the function attached to our rpc subscriptions object with a msg, in this case a simple string since it isn't in the scope of this unit test.
      augur.rpc.subscriptions['0xc1']('short string to be the msg for this simple test');

      finished();
    }
  });
  test({
    cb: { block: utils.noop },
    subscriptionsSupported: true,
    rpc: {
      subscriptions: {},
    	registerSubscriptionCallback: function(filterID, cb) {
        assert.deepEqual(filterID, '0xb1');
        // in this case 'this' refers to our test rpc obj.
        this.subscriptions[filterID] = cb;
    	}
    },
    filter: {
      block: {
        id: '0xb1',
        heartbeat: null
      },
      contracts: {
        id: '0xc1',
        heartbeat: null
      },
      testEvent: {
        id: '0xe1',
        heartbeat: null
      }
    },
    parse_block_message(msg, callback) {
      assert.deepEqual(msg, 'short string to be the msg for this simple test');
      assert.deepEqual(callback, utils.noop);
    },
    assertions: function() {
      assert.deepEqual(augur.filters.filter.block, {
        id: '0xb1',
        heartbeat: null
      });
      assert.deepEqual(augur.filters.filter.contracts, {
        id: '0xc1',
        heartbeat: null
      });
      assert.deepEqual(augur.filters.filter.testEvent, {
      	id: '0xe1',
      	heartbeat: null
      });
      // confirm that augur.rpc.subscriptions.0xb1 was set to the correct function.
      assert.include(augur.rpc.subscriptions['0xb1'].toString(), 'self.parse_block_message');
      // call the function attached to our rpc subscriptions object with a msg, in this case a simple string since it isn't in the scope of this unit test.
      augur.rpc.subscriptions['0xb1']('short string to be the msg for this simple test');

      finished();
    }
  });
});
describe("listen", function() {
  // 3 tests total
  var filter = augur.filters.filter;
  var clear_filter = augur.filters.clear_filter;
  var rpc = augur.rpc;
  var start_contracts_listener = augur.filters.start_contracts_listener;
  var start_block_listener = augur.filters.start_block_listener;
  var start_event_listener = augur.filters.start_event_listener;
  var pacemaker = augur.filters.pacemaker;
  var listen;
  var finished;
  afterEach(function() {
    augur.filters.filter = filter;
    augur.filters.clear_filter = clear_filter;
    augur.filters.start_contracts_listener = start_contracts_listener;
    augur.filters.start_block_listener = start_block_listener;
    augur.filters.start_event_listener = start_event_listener;
    augur.filters.pacemaker = pacemaker;
    augur.rpc = rpc;
    augur.filters.subscribeLogs = undefined;
    augur.filters.subscribeNewBlocks = undefined;
    augur.filters.unsubscribe = undefined;
  });
  var test = function(t) {
    it(JSON.stringify(t), function(done) {
      finished = done;
      augur.filters.filter = t.filter;
      augur.filters.clear_filter = t.clear_filter;
      augur.filters.start_contracts_listener = t.start_contracts_listener;
      augur.filters.start_block_listener = t.start_block_listener;
      augur.filters.start_event_listener = t.start_event_listener;
      augur.filters.pacemaker = t.pacemaker;
      augur.rpc = t.rpc;

      augur.filters.listen(t.cb, t.setup_complete);
    });
  };
  test({
    cb: { aNotRealLabel: utils.noop, block: utils.noop, contracts: utils.noop, testEvent: utils.noop },
    setup_complete: function(filters) {
      assert.deepEqual(filters, {
        block: { id: '0xb1', heartbeat: null },
        contracts: { id: '0xc1', heartbeat: null },
        testEvent: { id: '0xe1', heartbeat: null }
      });
      assert.isFunction(augur.filters.unsubscribe);
      assert.isFunction(augur.filters.subscribeLogs);
      assert.isFunction(augur.filters.subscribeNewBlocks);
      assert.isFunction(augur.rpc.resetCustomSubscription);
      finished();
    },
    filter: {
      block: { id: '0xb1', heartbeat: null },
      contracts: { id: '0xc1', heartbeat: null },
      testEvent: { id: '0xe1', heartbeat: null }
    },
    clear_filter: function(label, cb) {
      assert.oneOf(label, ['block', 'contracts', 'testEvent']);
      assert.include(cb.toString(), 'listenHelper');
      cb();
    },
    start_contracts_listener: function(cb) {
      assert.include(cb.toString(), 'self.pacemaker');
      cb();
    },
    start_block_listener: function(cb) {
      assert.include(cb.toString(), 'self.pacemaker');
      cb();
    },
    start_event_listener: function(label, cb) {
      assert.deepEqual(label, 'testEvent');
      assert.include(cb.toString(), 'self.pacemaker(p);');
      cb();
    },
    pacemaker: function() {},
    rpc: {
      wsUrl: null,
      ipcpath: null,
      newFilter: utils.noop,
      newBlockFilter: utils.noop,
      uninstallFilter: utils.noop,
      unregisterSubscriptionCallback: utils.noop,
      subscribeLogs: utils.noop,
      subscribeNewHeads: utils.noop,
      unsubscribe: utils.noop
    }
  });
  test({
    cb: { aNotRealLabel: utils.noop, block: utils.noop, contracts: utils.noop, testEvent: utils.noop },
    setup_complete: function(filters) {
      assert.deepEqual(filters, {
        block: { id: '0xb1', heartbeat: null },
        contracts: { id: '0xc1', heartbeat: null },
        testEvent: { id: '0xe1', heartbeat: null }
      });
      assert.isFunction(augur.filters.unsubscribe);
      assert.isFunction(augur.filters.subscribeLogs);
      assert.isFunction(augur.filters.subscribeNewBlocks);
      assert.isFunction(augur.rpc.resetCustomSubscription);
      finished();
    },
    filter: {
      block: { id: '0xb1', heartbeat: null },
      contracts: { id: '0xc1', heartbeat: null },
      testEvent: { id: '0xe1', heartbeat: null }
    },
    clear_filter: function(label, cb) {
      assert.oneOf(label, ['block', 'contracts', 'testEvent']);
      assert.include(cb.toString(), 'listenHelper');
      cb();
    },
    start_contracts_listener: function(cb) {
      assert.include(cb.toString(), 'self.pacemaker');
      cb();
    },
    start_block_listener: function(cb) {
      assert.include(cb.toString(), 'self.pacemaker');
      cb();
    },
    start_event_listener: function(label, cb) {
      assert.deepEqual(label, 'testEvent');
      assert.include(cb.toString(), 'self.pacemaker(p);');
      cb();
    },
    pacemaker: function() {},
    rpc: {
      wsUrl: 'somewsURL',
      ipcpath: 'someipcpath',
      newFilter: utils.noop,
      newBlockFilter: utils.noop,
      uninstallFilter: utils.noop,
      unregisterSubscriptionCallback: utils.noop,
      subscribeLogs: utils.noop,
      subscribeNewHeads: utils.noop,
      unsubscribe: utils.noop
    }
  });
  test({
    cb: { aNotRealLabel: utils.noop, block: utils.noop, contracts: utils.noop, testEvent: utils.noop },
    setup_complete: function(filters) {
      assert.deepEqual(filters, {
        block: { id: '0xb1', heartbeat: null },
        contracts: { id: '0xc1', heartbeat: null },
        testEvent: { id: null, heartbeat: null }
      });
      assert.isFunction(augur.filters.unsubscribe);
      assert.isFunction(augur.filters.subscribeLogs);
      assert.isFunction(augur.filters.subscribeNewBlocks);
      assert.isFunction(augur.rpc.resetCustomSubscription);
      // because we want full code coverage, we are going to replace listen real quick with a mock function, then run resetCustomSubscription which calls listen. Confirm that it would have been called and then finish the test.
      augur.filters.listen = listen;
      var listenCalled = false;
      augur.filters.listen = function() {
        listenCalled = true;
      };
      augur.rpc.resetCustomSubscription();
      augur.filters.listen = listen;
      assert.isTrue(listenCalled);
      finished();
    },
    filter: {
      block: { id: '0xb1', heartbeat: null },
      contracts: { id: '0xc1', heartbeat: null },
      testEvent: { id: null, heartbeat: null }
    },
    clear_filter: function(label, cb) {
      assert.oneOf(label, ['block', 'contracts', 'testEvent']);
      assert.include(cb.toString(), 'listenHelper');
      cb();
    },
    start_contracts_listener: function(cb) {
      assert.include(cb.toString(), 'self.pacemaker');
      cb();
    },
    start_block_listener: function(cb) {
      assert.include(cb.toString(), 'self.pacemaker');
      cb();
    },
    start_event_listener: function(label, cb) {
      assert.deepEqual(label, 'testEvent');
      assert.include(cb.toString(), 'self.pacemaker(p);');
      cb();
    },
    pacemaker: function() {},
    rpc: {
      wsUrl: 'somewsURL',
      ipcpath: 'someipcpath',
      newFilter: utils.noop,
      newBlockFilter: utils.noop,
      uninstallFilter: utils.noop,
      unregisterSubscriptionCallback: utils.noop,
      subscribeLogs: utils.noop,
      subscribeNewHeads: utils.noop,
      unsubscribe: utils.noop
    }
  });
});
describe("all_filters_removed", function() {
  // 2 tests total
  var filter = augur.filters.filter;
  afterEach(function() {
    augur.filters.filter = filter;
  });
  var test = function(t) {
    it(JSON.stringify(t), function() {
      augur.filters.filter = t.filter || filter;

      t.assertions(augur.filters.all_filters_removed());
    });
  };
  test({
    assertions: function(isRemoved) {
      assert.isTrue(isRemoved);
    }
  });
  test({
    filter: { test: { id: '0x1', heartbeat: null} },
    assertions: function(isRemoved) {
      assert.isFalse(isRemoved);
    }
  });
});
describe("ignore", function() {
  // 3 tests total
  var filter = augur.filters.filter;
  var rpc = augur.rpc;
  var unsubscribe = augur.filters.unsubscribe;
  var finished;
  afterEach(function() {
    augur.filters.filter = filter;
    augur.filters.unsubscribe = unsubscribe;
    augur.rpc = rpc;
  });
  var test = function(t) {
    it(t.description, function(done) {
      finished = done;
      augur.filters.filter = t.filter;
      augur.filters.unsubscribe = t.unsubscribe;
      augur.rpc = t.rpc;

      augur.filters.ignore(t.uninstall, t.cb, t.complete);
    });
  };
  test({
  	description: 'Should handle unsubscribing from 3 filters when uninstall is true',
  	rpc: {
  		wsURL: 'ws.augur.net',
  		ipcpath: 'ipc.augur.net',
  		unregisterSubscriptionCallback: function(id) {
        // doesn't need to do anything, simply don't want to call the real version.
  		}
  	},
  	filter: {
  		block: {
  			id: '0xb1',
  			heartbeat: setInterval(utils.noop, 10000000000000000)
  		},
  		contracts: {
  			id: '0xc1',
  			heartbeat: setInterval(utils.noop, 10000000000000000)
  		},
  		testEvent: {
  			id: '0xe1',
  			heartbeat: setInterval(utils.noop, 10000000000000000)
  		}
  	},
  	uninstall: true,
  	cb: {},
  	complete: function() {
  		// here we are only completing the test when everything is nulled out.
  		var areWeDone = true;
  		for (var label in augur.filters.filter) {
  			if (augur.filters.filter.hasOwnProperty(label)) {
          var f = augur.filters.filter[label];
          if (f.id !== null || f.heartbeat !== null) {
            areWeDone = false;
            break;
          }
        }
  		}
  		if (areWeDone) {
  			assert.deepEqual(augur.filters.filter, {
  				block: {
  					id: null,
  					heartbeat: null
  				},
  				contracts: {
  					id: null,
  					heartbeat: null
  				},
  				testEvent: {
  					id: null,
  					heartbeat: null
  				}
  			});
  			finished();
  		}
  	},
  	unsubscribe: function(id, cb) {
  		if (!utils.is_function(cb)) return '1';
  		return cb('1');
  	}
  });
  test({
  	description: 'Should handle unsubscribing from 3 filters when uninstall is an object',
  	rpc: {
  		wsURL: 'ws.augur.net',
  		ipcpath: null,
      unregisterSubscriptionCallback: function(id) {
        // doesn't need to do anything, simply don't want to call the real version.
  		}
  	},
  	filter: {
  		block: {
  			id: '0xb1',
  			heartbeat: setInterval(utils.noop, 10000000000000000)
  		},
  		contracts: {
  			id: '0xc1',
  			heartbeat: setInterval(utils.noop, 10000000000000000)
  		},
  		testEvent: {
  			id: '0xe1',
  			heartbeat: setInterval(utils.noop, 10000000000000000)
  		}
  	},
  	uninstall: {
      block: function() { augur.filters.filter.block.id = null; },
      contracts: function() { augur.filters.filter.contracts.id = null; },
      testEvent: function() { augur.filters.filter.testEvent.id = null; },
    },
  	cb: {},
  	complete: function() {
  		// here we are only completing the test when everything is nulled out.
  		var areWeDone = true;
  		for (var label in augur.filters.filter) {
  			if (augur.filters.filter.hasOwnProperty(label)) {
          var f = augur.filters.filter[label];
          if (f.id !== null || f.heartbeat !== null) {
            areWeDone = false;
            break;
          }
        }
  		}
  		if (areWeDone) {
  			assert.deepEqual(augur.filters.filter, {
  				block: {
  					id: null,
  					heartbeat: null
  				},
  				contracts: {
  					id: null,
  					heartbeat: null
  				},
  				testEvent: {
  					id: null,
  					heartbeat: null
  				}
  			});
  			finished();
  		}
  	},
  	unsubscribe: function(id, cb) {
  		if (!utils.is_function(cb)) return '1';
  		return cb('1');
  	}
  });
  test({
  	description: 'Should handle unsubscribing from 3 filters when uninstall is true, complete passed as cb, complete undefined.',
  	rpc: {
  		wsURL: 'ws.augur.net',
  		ipcpath: 'ipc.augur.net',
  		unregisterSubscriptionCallback: function(id) {
        // doesn't need to do anything, simply don't want to call the real version.
  		}
  	},
  	filter: {
  		block: {
  			id: '0xb1',
  			heartbeat: setInterval(utils.noop, 10000000000000000)
  		},
  		contracts: {
  			id: '0xc1',
  			heartbeat: setInterval(utils.noop, 10000000000000000)
  		},
  		testEvent: {
  			id: '0xe1',
  			heartbeat: setInterval(utils.noop, 10000000000000000)
  		}
  	},
  	uninstall: true,
  	cb: function() {
  		// here we are only completing the test when everything is nulled out.
  		var areWeDone = true;
  		for (var label in augur.filters.filter) {
  			if (augur.filters.filter.hasOwnProperty(label)) {
          var f = augur.filters.filter[label];
          if (f.id !== null || f.heartbeat !== null) {
            areWeDone = false;
            break;
          }
        }
  		}
  		if (areWeDone) {
  			assert.deepEqual(augur.filters.filter, {
  				block: {
  					id: null,
  					heartbeat: null
  				},
  				contracts: {
  					id: null,
  					heartbeat: null
  				},
  				testEvent: {
  					id: null,
  					heartbeat: null
  				}
  			});
  			finished();
  		}
  	},
  	complete: undefined,
  	unsubscribe: function(id, cb) {
  		if (!utils.is_function(cb)) return { returnValue: '1' };
  		return cb({ returnValue: '1' });
  	}
  });
});
