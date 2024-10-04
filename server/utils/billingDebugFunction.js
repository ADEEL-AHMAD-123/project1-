const axios = require('axios');
const crypto = require('crypto');

async function debugBillingConnection(req, res) {
  try {
    // Set up the billing server API details
    const apiKey = 'KEY-XxYVU7WxkDExD27lNFuU';
    const apiSecret = 'SECRET-ClBHdDz8eAZ4Ds4bDOIhHD32w';
    const billingServerUrl = 'http://65.108.146.238/mbilling';
    
    // Step 1: Generate a nonce (unique number for each request)
    const nonce = process.hrtime()[1] + Math.floor(Math.random() * 1000000);
    console.log('Generated nonce:', nonce);

    // Step 2: Prepare the POST data for the request
    const postData = new URLSearchParams({
      username: 'debug-test',
      password: '11111111',
      id_group: 3,
      callingcard_pin: Math.floor(Math.random() * 1000000).toString(), // Generate a random pin
      module: 'user',
      action: 'save',
      id: 0,
      nonce: nonce
    }).toString();
    console.log('Generated POST data:', postData);

    // Step 3: Generate the signature using HMAC SHA512
    const sign = crypto.createHmac('sha512', apiSecret).update(postData).digest('hex');
    console.log('Generated signature:', sign);

    // Step 4: Prepare the headers
    const headers = {
      'key': apiKey,
      'sign': sign,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    console.log('Generated headers:', headers);

    // Step 5: Send the request to the billing server
    const url = `${billingServerUrl}/index.php/user/save`;
    console.log('Making request to URL:', url);

    const response = await axios.post(url, postData, { headers });
    console.log('Billing server response:', response.data);

    // Respond to the debug request
    res.status(200).json({
      success: true,
      message: 'Successfully connected to the billing server!',
      data: response.data
    });
  } catch (error) {
    console.error('Error connecting to billing server:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to the billing server.',
      error: error.message
    });
  }
}

module.exports = {
  debugBillingConnection
}; 
