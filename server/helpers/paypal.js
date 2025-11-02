const paypal = require("paypal-rest-sdk");


paypal.configure({
  mode: "sandbox", // "live" khi chạy thật
  client_id: "AQ_d1Q4apqcFgdFzhzYW4Ji8BnZBIyhVbQVqPX4NIgOB53H2iPPnWcfUIA13e7KqK8qiBE3W-Ae28ynl",
  client_secret: "EOK12to7uqHBxlR3Lz1z-kF5YaF6S9oJ724mXvFYk6epy28aJkChKKulDNMrUx9JuqZtPQUKGPbKXbAC"
});

module.exports = paypal;