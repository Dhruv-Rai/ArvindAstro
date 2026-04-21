const express = require('express');

const router = express.Router();

router.all('*', function(req, res) {
  res.status(410).json({
    success: false,
    error: 'Deprecated endpoint. Use /api/get-token and /api/payment/phonepe/status/:transactionId.'
  });
});

module.exports = router;
