const moment = require('moment');
const CallSummary = require('../models/BillingSummary');
const logger = require('./logger');
const BillingSwitchServer = require('../services/BillingSwitchServer');
const apiKeyInbound = process.env.SWITCH_BILLING_INBOUND_API_KEY;
const apiSecretInbound = process.env.SWITCH_BILLING_INBOUND_API_SECRET;
const apiKeyOutbound = process.env.SWITCH_BILLING_OUTBOUND_API_KEY;
const apiSecretOutbound = process.env.SWITCH_BILLING_OUTBOUND_API_SECRET;

// Initialize servers for inbound and outbound
const inboundServer = new BillingSwitchServer(apiKeyInbound, apiSecretInbound);
const outboundServer = new BillingSwitchServer(apiKeyOutbound, apiSecretOutbound);

// Function to select the appropriate server based on the query type
const getBillingServer = (type) => {
  return type === 'outbound' ? outboundServer : inboundServer;
};

// Helper function to fetch all pages from billing API
const fetchAllPages = async (module, type = 'inbound', initialPage = 1) => {
  const billingServer = getBillingServer(type);
  const initialResult = await billingServer.read(module, initialPage);
  const pages = Math.ceil(initialResult.count / 25);
  let allResults = initialResult.rows;

  for (let i = 2; i <= pages; i++) {
    const result = await billingServer.read(module, i);
    allResults = allResults.concat(result.rows);
  }

  return allResults;
};

// Helper function to fetch data from MongoDB based on the provided parameters
const fetchDataFromMongoDB = async ({ startDate, endDate, id_user, skip, limit, page }) => {
  const filter = {};

  if (id_user) {
    filter.id_user = id_user; // Filter by numeric user ID
  }

  if (startDate && endDate) {
    filter.day = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    filter.day = { $gte: startDate };
  } else if (endDate) {
    filter.day = { $lte: endDate };
  }

  const mongodbResults = await CallSummary.find(filter).skip(skip).limit(limit);
  const totalCount = await CallSummary.countDocuments(filter);

  return {
    data: mongodbResults,
    pagination: {
      total: totalCount,
      page: parseInt(page),
      limit: limit,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

// Helper function to store data in MongoDB
const storeDataInMongoDB = async (data) => {
  try {
    // Validate the incoming data
    if (!data || !Array.isArray(data.rows) || data.rows.length === 0) {
      throw new Error('No data to store');
    }


    // Clean and validate records
    const records = data.rows.map((record) => {
      const cleanedRecord = Object.fromEntries(
        Object.entries(record).filter(([key, value]) => value !== null && value !== undefined)
      );

      // Log each cleaned record to ensure it's structured correctly
      console.log('Cleaned Record:', cleanedRecord);

      // Check for essential fields (id, day, id_user)
      if (!cleanedRecord.id || !cleanedRecord.day || !cleanedRecord.id_user) {
        throw new Error(`Record missing essential fields: ${JSON.stringify(cleanedRecord)}`);
      }

      return cleanedRecord;
    });

    // Log records that are about to be inserted/updated
    console.log('Processed Records:', records);

    // Create bulk operations with update criteria
    const bulkOperations = records.map((record) => {
      console.log('Creating Bulk Operation for Record:', record);  // Log the record being processed
      return {
        updateOne: {
          filter: { id: record.id, day: record.day, id_user: record.id_user },
          update: { $set: record },
          upsert: true,  // Insert if not found
        },
      };
    });

    // Perform bulkWrite operation
    const result = await CallSummary.bulkWrite(bulkOperations);

    // Log the result from bulkWrite
    console.log('BulkWrite result:', result);

    // Log the counts of upserts and updates
    const nUpserted = result.upsertedCount || 0;
    const nModified = result.modifiedCount || 0;
    const nMatched = result.matchedCount || 0;
    
    logger.info(`Successfully stored ${nUpserted} inserted, ${nModified} modified, and ${nMatched} matched documents in MongoDB`);

    return result;

  } catch (err) {
    // Log the error with detailed context
    logger.error(`Failed to store data in MongoDB: ${err.message}`, {
      error: err,
      data: data,
    });
    throw new Error(`Failed to store data in MongoDB: ${err.message}`);
  }
};


// Helper function to generate a random pin
const generateRandomPin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit pin
};

// Helper function to fetch billing account from the appropriate server (inbound or outbound)
const fetchBillingAccount = async (id, type = 'inbound') => {
  try {
    // Choose the appropriate billing server based on type
    const billingServer = getBillingServer(type);
    
    billingServer.clearFilter(); // Clear any previous filters
    billingServer.setFilter("id", id, "eq", "numeric"); // Set filter for specific ID

    // Assume billing account is stored by user_id on the switchBilling server
    const apiResponse = await billingServer.read('user');

console.log(apiResponse.rows,apiResponse.rows.data);

    if (!apiResponse || !apiResponse.rows) {
      throw new Error('Failed to fetch billing account from switchBilling');
    }

    // Return the billing account details
    return apiResponse.rows[0];
  } catch (error) {
    logger.error(`Error fetching billing account for user.   ${error.message}`);
    throw new Error(`Could not fetch billing account: ${error.message}`);
  }
};

module.exports = {
  getBillingServer,
  fetchAllPages,
  fetchDataFromMongoDB,
  storeDataInMongoDB,
  generateRandomPin,
  fetchBillingAccount, // Export the new helper function
};
