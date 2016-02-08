/******************************
 * Locally stored order book. *
 ******************************/

var NODE_JS = (typeof module !== "undefined") && process && !process.browser;

var fzero = require("fzero");
var Decimal = require("decimal.js");
var abi = require("augur-abi");
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require("node-localstorage").LocalStorage;
    localStorage = new LocalStorage("./scratch");
}
var errors = require("augur-contracts").errors;
var constants = require("../constants");
var utils = require("../utilities");

module.exports = {

    limit: {

        fill: function (marketInfo, order) {
            var amount, filled;
            var q = new Array(marketInfo.numOutcomes);
            for (var i = 0; i < marketInfo.outcomes; ++i) {
                q[i] = marketInfo.outcomes[i].outstandingShares;
            }
            var n = this.sharesToTrade(q, order.outcome-1, marketInfo.alpha, order.limit);

            // if n >= amount, this is a stop order
            if (n.gte(amount)) {
                amount = order.amount.toFixed();
                filled = true;

            // otherwise, trade n shares (amount - n shares remain open)
            } else {
                amount = n.toFixed();
                order.amount = order.amount.minus(n).toFixed();
                filled = false;
            }
            return {amount: amount, order: order, filled: filled};
        },

        sharesToTrade: function (q, i, a, cap) {
            var self = this;
            q = utils.toDecimal(q);
            a = utils.toDecimal(a);
            cap = utils.toDecimal(cap);
            return fzero(function (n) {
                return self.f(n, q, i, a, cap);
            }, 1e-12, 1000).solution;
        },

        // LS-LMSR objective function (optimize n)
        f: function (n, q, i, a, cap) {
            n = utils.toDecimal(n);
            var numOutcomes = q.length;
            var qj = new Array(numOutcomes);
            var sum_q = new Decimal(0);
            for (var j = 0; j < numOutcomes; ++j) {
                qj[j] = q[j];
                sum_q = sum_q.plus(q[j]);
            }
            qj.splice(i, 1);
            var q_plus_n = n.plus(sum_q);
            var b = a.times(q_plus_n);
            var exp_qi = q[i].plus(n).dividedBy(b).exp();
            var exp_qj = new Array(numOutcomes);
            var sum_qj = new Decimal(0);
            var sum_exp_qj = new Decimal(0);
            var sum_qj_x_expqj = new Decimal(0);
            for (j = 0; j < numOutcomes - 1; ++j) {
                sum_qj = sum_qj.plus(qj[j]);
                exp_qj[j] = qj[j].dividedBy(b).exp();
                sum_exp_qj = sum_exp_qj.plus(exp_qj[j]);
                sum_qj_x_expqj = sum_qj_x_expqj.plus(q[j].times(exp_qj[j]));
            }
            return a.times(q[i].plus(n).dividedBy(b).exp().plus(sum_exp_qj).ln()).plus(
                exp_qi.times(sum_qj).minus(sum_qj_x_expqj).dividedBy(
                    q_plus_n.times(exp_qi.plus(sum_exp_qj))
                ).minus(cap)
            );
        },

        // First derivative of f
        fprime: function (n, q, i, a, cap) {
            var eps = new Decimal(n.dividedBy(new Decimal(10000)));
            return this.f(n.plus(eps), q, i, a, cap)
                .minus(this.f(n.minus(eps), q, i, a, cap))
                .dividedBy(eps.times(new Decimal(2)));
        }

    },

    get: function (account, cb) {
        cb = cb || utils.pass;
        if (!account) return cb(errors.DB_READ_FAILED);
        try {
            return JSON.parse(localStorage.getItem(account));
        } catch (ex) {
            return cb(ex);
        }
    },

    // TODO add a "sync my orders" button that sends to IPFS
    // order: {account, market, outcome, price, amount, expiration, cap}
    create: function (order, cb) {
        cb = cb || utils.pass;
        if (order && order.account && order.market && order.outcome &&
            order.price !== null && order.price !== undefined &&
            order.amount !== null && order.amount !== undefined) {
            var orders = this.get(order.account);
            if (!orders) orders = {};
            if (!orders[order.market]) orders[order.market] = {};
            if (!orders[order.market][order.outcome]) {
                orders[order.market][order.outcome] = [];
            }
            var details = {
                price: order.price,
                amount: order.amount,
                expiration: order.expiration,
                cap: order.cap,
                timestamp: new Date().getTime()
            };
            details.id = utils.sha256([
                details.price.toString(),
                details.expiration.toString(),
                details.cap.toString(),
                details.timestamp.toString()
            ]);
            orders[order.market][order.outcome].push(details);
            localStorage.setItem(order.account, JSON.stringify(orders));
            return cb(orders);
        }
        return cb(errors.DB_WRITE_FAILED);
    },

    cancel: function (account, market, outcome, orderId, cb) {
        cb = cb || utils.pass;
        if (!orderId) return cb(errors.DB_DELETE_FAILED);
        var orders = this.get(account);
        if (!orders || !orders[market] || !orders[market][outcome]) {
            return cb(errors.DB_DELETE_FAILED);
        }
        for (var i = orders[market][outcome].length - 1; i >= 0; i--) {
            if (orders[market][outcome][i].id === orderId) {
                orders[market][outcome].splice(i, 1);
                localStorage.setItem(account, JSON.stringify(orders));
                return cb(orders);
            }
        }
        return cb(errors.DB_DELETE_FAILED);
    },

    reset: function (account, cb) {
        cb = cb || utils.pass;
        if (account !== null && account !== undefined && account !== "") {
            localStorage.removeItem(account);
            return cb(true);
        }
        return cb(errors.DB_DELETE_FAILED);
    }

};