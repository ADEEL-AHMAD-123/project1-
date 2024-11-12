const moment = require('moment');
const OutboundUsage = require('../models/OutBoundUsage');
const InboundUsage = require('../models/InBoundUsage');
const logger = require('./logger');
const BillingSwitchServer = require('../services/BillingSwitchServer');
const apiKeyInbound = process.env.SWITCH_BILLING_INBOUND_API_KEY;
const apiSecretInbound = process.env.SWITCH_BILLING_INBOUND_API_SECRET;
const apiKeyOutbound = process.env.SWITCH_BILLING_OUTBOUND_API_KEY;
const apiSecretOutbound = process.env.SWITCH_BILLING_OUTBOUND_API_SECRET; 
const BillingAccount = require("../models/BillingAccount"); 

// Initialize servers for inbound and outbound
const inboundServer = new BillingSwitchServer(apiKeyInbound, apiSecretInbound);
const outboundServer = new BillingSwitchServer(apiKeyOutbound, apiSecretOutbound);

// Helper function to select the appropriate collection based on type
const getUsageCollection = (type) => {
  return type === 'outbound' ? OutboundUsage : InboundUsage;
};

// Helper function to select the appropriate server based on type
const getBillingServer = (type) => {
  return type === 'outbound' ? outboundServer : inboundServer;
};

// Helper function to fetch data from the third-party server based on type and module
const fetchDataFromServer = async (module, type = 'inbound') => {
  const billingServer = getBillingServer(type);  // Get the server based on type
  
  try {
    billingServer.clearFilter()
    // Make the request to the third-party API using the server instance and module
    const apiResult = await billingServer.read(module);
    return apiResult;
  } catch (err) {
    logger.error(`Error fetching data from server: ${err.message}`, {
      error: err,
      module,
      type
    });
    throw new Error(`Failed to fetch data from server: ${err.message}`);
  }
};


// Helper function to fetch data from MongoDB based on the provided parameters for each specific day
const fetchDataFromMongoDB = async ({ type = 'inbound', startDate, endDate, id_user, skip, limit, page }) => {
  const UsageCollection = getUsageCollection(type);
  const filter = {};

  if (id_user) {
    filter.id_user = id_user;
  }

  // Convert startDate and endDate to strings in 'YYYY-MM-DD' format
  if (startDate && endDate) {
    filter.day = { $gte: moment(startDate).format("YYYY-MM-DD"), $lte: moment(endDate).format("YYYY-MM-DD") };
  } else if (startDate) {
    filter.day = { $gte: moment(startDate).format("YYYY-MM-DD") };
  } else if (endDate) {
    filter.day = { $lte: moment(endDate).format("YYYY-MM-DD") };
  }

  const mongodbResults = await UsageCollection.find(filter).skip(skip).limit(limit);
  const totalCount = await UsageCollection.countDocuments(filter);

  return {
    data: mongodbResults,
    pagination: {
      totalItems: totalCount,
      currentPage: parseInt(page),
      limit: limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};



// Helper function to fetch data from MongoDB in a monthly aggregated format
const fetchMonthlyDataFromMongoDB = async ({ type = 'inbound', startDate, endDate, id_user, skip, limit, page }) => {
  const UsageCollection = getUsageCollection(type);
  const match = {};

  if (id_user) {
    match.id_user = id_user;
  }

  // Convert startDate and endDate to 'YYYY-MM-DD' string format for string comparison
  if (startDate && endDate) {
    match.day = { $gte: moment(startDate).format("YYYY-MM-DD"), $lte: moment(endDate).format("YYYY-MM-DD") };
  } else if (startDate) {
    match.day = { $gte: moment(startDate).format("YYYY-MM-DD") };
  } else if (endDate) {
    match.day = { $lte: moment(endDate).format("YYYY-MM-DD") };
  }

  const pipeline = [
    { $match: match },
    // Convert `day` from string to date for grouping
    { $addFields: { day: { $toDate: "$day" } } },
    { 
      $group: {
        _id: {
          id_user: "$id_user",
          year: { $year: "$day" },
          month: { $month: "$day" },
        },
        totalAgentBill: { $sum: "$agent_bill" },
        totalAlocAllCalls: { $sum: "$aloc_all_calls" },
        totalBuyCost: { $sum: "$buycost" },
        totalLucro: { $sum: "$lucro" },
        totalNbCall: { $sum: "$nbcall" },
        totalNbCallFail: { $sum: "$nbcall_fail" },
        totalSessionBill: { $sum: "$sessionbill" },
        totalSessionTime: { $sum: "$sessiontime" },
        averageAsr: { $avg: "$asr" },
        totalRecords: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": -1, "_id.month": -1, "_id.id_user": 1 } },
    { $skip: skip || 0 },
    { $limit: limit || 10 },
  ];

  const mongodbResults = await UsageCollection.aggregate(pipeline);
  const uniqueCount = mongodbResults.length;
  const totalCount = await UsageCollection.countDocuments(match);

  const formattedData = mongodbResults.map(item => ({
    id_user: item._id.id_user,
    year: item._id.year,
    month: item._id.month,
    totalAgentBill: item.totalAgentBill,
    totalAlocAllCalls: item.totalAlocAllCalls,
    totalBuyCost: item.totalBuyCost,
    totalLucro: item.totalLucro,
    totalNbCall: item.totalNbCall,
    totalNbCallFail: item.totalNbCallFail,
    totalSessionBill: item.totalSessionBill,
    totalSessionTime: item.totalSessionTime,
    averageAsr: item.averageAsr,
    totalRecords: item.totalRecords,
  }));

  return {
    data: formattedData,
    pagination: {
      totalItems: uniqueCount,
      currentPage: parseInt(page),
      limit: limit,
      totalPages: Math.ceil(uniqueCount / limit),
    },
  };
};




// Helper function to store data in MongoDB
const storeDataInMongoDB = async (data, type = 'inbound') => {
  try {
    const UsageCollection = getUsageCollection(type);

    if (!data || !Array.isArray(data.rows) || data.rows.length === 0) {
      throw new Error('No data to store');
    }

    const records = data.rows.map((record) => {
      const cleanedRecord = Object.fromEntries(
        Object.entries(record).filter(([key, value]) => value !== null && value !== undefined)
      );

      if (!cleanedRecord.id || !cleanedRecord.day || !cleanedRecord.id_user) {
        throw new Error(`Record missing essential fields: ${JSON.stringify(cleanedRecord)}`);
      }

      return cleanedRecord;
    });

    const bulkOperations = records.map((record) => ({
      updateOne: {
        filter: { id: record.id, day: record.day, id_user: record.id_user },
        update: { $set: record },
        upsert: true,
      },
    }));

    const result = await UsageCollection.bulkWrite(bulkOperations);

    logger.info(`Stored ${result.upsertedCount || 0} new, ${result.modifiedCount || 0} modified, and ${result.matchedCount || 0} matched documents in MongoDB`);
    return result;

  } catch (err) {
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


// Helper function to fetch billing account credit
const fetchBillingAccountCredit = async (userId, type = 'inbound') => {
  try {
    
    
    // Fetch the billing account for the user from MongoDB
    const existingBillingAccount = await BillingAccount.findOne({ user_id: userId });

    if (!existingBillingAccount) {
      return next(createError(404, "Billing account not found for this user"));
    }

    const { id } = existingBillingAccount;

    const billingServer = getBillingServer(type);
    // Set up server filter to retrieve billing account credit
    billingServer.clearFilter();
    billingServer.setFilter("id", id, "eq", "numeric");

    // Fetch the user data from the billing server
    const apiResponse = await billingServer.read('user');
    
    if (!apiResponse || !apiResponse.rows || apiResponse.rows.length === 0) {
      throw new Error('No credit data found for the user');
    }
    
    // Extract the credit information from the response
    const creditData = apiResponse.rows[0].credit;
    return creditData;
  } catch (error) {
    logger.error(`Error fetching billing account credit for user ${userId}: ${error.message}`);
    throw new Error(`Could not fetch billing account credit: ${error.message}`);
  }
};

// Helper function to calculate usage summary on daily bases from inbound and outbound usages data
const calculateUsageSummary = async ({ startDate, endDate, id_user, period = 'daily', limit = 10, page = 1,skip }) => {
  const fetchDataFunction = fetchDataFromMongoDB;

  // Fetch data for inbound and outbound
  const inboundDataResult = await fetchDataFunction({
    type: 'inbound', 
    startDate, 
    endDate, 
    id_user, 
    limit,
    page,
    skip
  }) || {};
  
  const outboundDataResult = await fetchDataFunction({
    type: 'outbound', 
    startDate, 
    endDate, 
    id_user, 
    limit,
    page,
    skip
  }) || {};

  const inboundData = inboundDataResult.data || [];
  const outboundData = outboundDataResult.data || [];
  const combinedData = [...inboundData, ...outboundData];
  const groupedData = {};


  // Group by day and user
  combinedData.forEach(record => {
    const date = moment(record.day);
    const groupKey = `${date.format('YYYY-MM-DD')}_${record.id_user}`;

    if (!groupedData[groupKey]) {
      groupedData[groupKey] = {
        day: date.format('YYYY-MM-DD'),
        id_user: record.id_user,
        idUserusername: record.idUserusername,
        agent_bill: 0,
        aloc_all_calls: 0,
        asr: 0,
        buycost: 0,
        lucro: 0,
        nbcall: 0,
        nbcall_fail: 0,
        sessionbill: 0,
        sessiontime: 0
      };
    }

    const userGroup = groupedData[groupKey];
    userGroup.agent_bill += record.agent_bill || 0;
    userGroup.aloc_all_calls += record.aloc_all_calls || 0;
    userGroup.buycost += record.buycost || 0;
    userGroup.lucro += record.lucro || 0;
    userGroup.nbcall += record.nbcall || 0;
    userGroup.nbcall_fail += record.nbcall_fail || 0;
    userGroup.sessionbill += record.sessionbill || 0;
    userGroup.sessiontime += record.sessiontime || 0;
  });

  const usageSummary = [];
  Object.values(groupedData).forEach(summary => {
    summary.asr = summary.nbcall > 0 ? ((summary.nbcall - summary.nbcall_fail) / summary.nbcall) * 100 : 0;
    usageSummary.push(summary);
  });

  // Determine unique total records based on database totals
  const inboundTotal = inboundDataResult.pagination?.totalItems || 0;
  const outboundTotal = outboundDataResult.pagination?.totalItems || 0;

  // Estimate total unique records based on grouping logic
  // (ideally, we should fetch the unique count of records based on day and id_user across the whole date range)
  const combinedTotalRecords = Math.min(inboundTotal, outboundTotal);

  const totalPages = Math.ceil(combinedTotalRecords / limit);

  return {
    data: usageSummary,
    pagination: {
      totalItems: combinedTotalRecords, // Estimated or fetched unique total count
      totalPages,                   // Pages based on unique total
      limit,                        // Items per page
      currentPage:page                          // Current page
    },
  };
};




// Helper function to calculate usage summary on monthly basis from inbound and outbound usages data
const calculateMonthlyUsageSummary = async ({ startDate, endDate, id_user, limit = 10, page = 1 }) => {
  const fetchDataFunction = fetchMonthlyDataFromMongoDB; // Use the monthly function for monthly data

  // Fetch data for inbound and outbound
  const inboundDataResult = await fetchDataFunction({ type: 'inbound', startDate, endDate, id_user, limit, page }) || {};
  const outboundDataResult = await fetchDataFunction({ type: 'outbound', startDate, endDate, id_user, limit, page }) || {};

  const inboundData = inboundDataResult.data || [];
  const outboundData = outboundDataResult.data || [];
  const combinedData = [...inboundData, ...outboundData];
  const groupedData = {};

  // Group records by year-month and user
  combinedData.forEach(record => {
    const groupKey = `${record.year}-${String(record.month).padStart(2, '0')}`;
    
    if (!groupedData[groupKey]) {
      groupedData[groupKey] = {};
    }

    const userGroup = groupedData[groupKey][record.id_user] || {
      id_user: record.id_user,
      year: record.year,
      month: record.month,
      totalAgentBill: 0,
      totalAlocAllCalls: 0,
      totalBuyCost: 0,
      totalLucro: 0,
      totalNbCall: 0,
      totalNbCallFail: 0,
      totalSessionBill: 0,
      totalSessionTime: 0,
      totalRecords: 0
    };

    userGroup.totalAgentBill += record.totalAgentBill || 0;
    userGroup.totalAlocAllCalls += record.totalAlocAllCalls || 0;
    userGroup.totalBuyCost += record.totalBuyCost || 0;
    userGroup.totalLucro += record.totalLucro || 0;
    userGroup.totalNbCall += record.totalNbCall || 0;
    userGroup.totalNbCallFail += record.totalNbCallFail || 0;
    userGroup.totalSessionBill += record.totalSessionBill || 0;
    userGroup.totalSessionTime += record.totalSessionTime || 0;
    userGroup.totalRecords += 1;

    groupedData[groupKey][record.id_user] = userGroup;
  });

  // Calculate ASR and prepare monthly usage summary
  const monthlyUsageSummary = [];
  Object.keys(groupedData).forEach(groupKey => {
    Object.keys(groupedData[groupKey]).forEach(userId => {
      const summary = groupedData[groupKey][userId];
      summary.averageAsr = summary.totalNbCall > 0
        ? ((summary.totalNbCall - summary.totalNbCallFail) / summary.totalNbCall) * 100
        : 0;
      monthlyUsageSummary.push(summary);
    });
  });

  // Determine unique total records for pagination
  const inboundTotal = inboundDataResult.pagination?.total || 0;
  const outboundTotal = outboundDataResult.pagination?.total || 0;

  // Estimate total unique records based on grouping logic (or fetch the unique count of (year, month, id_user) records)
  const combinedTotalRecords = Math.min(inboundTotal, outboundTotal);
  const totalPages = Math.ceil(combinedTotalRecords / limit);


  return {
    data: monthlyUsageSummary,
    pagination: {
      totalItems: combinedTotalRecords, // Estimated or fetched unique total count
      totalPages,                   // Pages based on unique total
      limit,                        // Items per page
      currentPage:page,                          // Current page
    },
  };
};


module.exports = {
  getBillingServer,
  fetchDataFromMongoDB,
  storeDataInMongoDB,
  generateRandomPin,
  fetchBillingAccount,
  fetchBillingAccountCredit,
  fetchMonthlyDataFromMongoDB,
  fetchDataFromServer,
  calculateUsageSummary,
  calculateMonthlyUsageSummary
};
