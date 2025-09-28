import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";

// --- Configuration ---
// IMPORTANT: For production, use environment variables or a secure credentials management system
// instead of hardcoding your keys in the code.
const S3_CONFIG = {
  endpoint: "https://o3-rc2.akave.xyz",
  region: "akave-network",
  credentials: {
    accessKeyId: "O3_4EJ1FJ3J7KV2DQHO7",
    secretAccessKey: "7kx3IUWKUEt0RhbefUaR6RlXxjtyY1AwzY0keL",
  },
};

// Create an S3 client instance
const s3Client = new S3Client(S3_CONFIG);

/**
 * Checks if a bucket exists and creates it if it does not.
 * @param {string} bucketName - The name of the bucket to check/create.
 */
const createBucketIfNotExists = async (bucketName) => {
  try {
    // Check if the bucket exists using a lightweight HeadBucket command.
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket "${bucketName}" already exists.`);
  } catch (error) {
    // If the error is a 404, it means the bucket doesn't exist.
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      console.log(`Bucket "${bucketName}" not found. Creating it...`);
      try {
        // Create the bucket.
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
        console.log(`Successfully created bucket "${bucketName}".`);
      } catch (createError) {
        console.error(`Error creating bucket:`, createError);
        throw createError; // Throw the error from the creation attempt
      }
    } else {
      // For any other errors (e.g., permissions), re-throw them.
      console.error(`Error checking bucket existence:`, error);
      throw error;
    }
  }
};

/**
 * Uploads a transaction JSON object to an S3 bucket.
 * The walletAddress is used as the bucket name.
 * @param {string} walletAddress - The name of the bucket.
 * @param {object} transaction - The transaction object to upload.
 * @returns {Promise<object>} The response from the S3 PutObject command.
 */
const addTransaction = async (walletAddress, transaction) => {
  try {
    const bucketName = walletAddress.toLowerCase();
    const objectKey = `${transaction.id}.json`;
    const transactionString = JSON.stringify(transaction, null, 2);

    await createBucketIfNotExists(bucketName);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: transactionString,
      ContentType: "application/json",
    });

    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw new Error(error.message);
  }
};

/**
 * Retrieves and parses a transaction JSON object from an S3 bucket.
 * @param {string} walletAddress - The name of the bucket.
 * @param {string} transactionId - The ID of the transaction to retrieve.
 * @returns {Promise<object>} The parsed transaction object.
 */
const getTransaction = async (walletAddress, transactionId) => {
  try {
    const bucketName = walletAddress.toLowerCase();
    const objectKey = `${transactionId}.json`;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const response = await s3Client.send(command);
    // The Body is a stream. We need to convert it to a string.
    const transactionString = await response.Body.transformToString();
    return JSON.parse(transactionString);
  } catch (error) {
    console.error("Error getting transaction:", error);
    throw new Error(error.message);
  }
};

/**
 * Lists all transaction objects in a given S3 bucket.
 * @param {string} walletAddress - The name of the bucket.
 * @returns {Promise<Array<object>>} An array of objects containing metadata for each file.
 */
const getAllTransactions = async (walletAddress) => {
  try {
    const bucketName = walletAddress.toLowerCase();
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
    });

    const response = await s3Client.send(command);
    // response.Contents is an array of objects in the bucket.
    // If the bucket is empty, response.Contents will be undefined.
    return response.Contents || [];
  } catch (error) {
    console.error("Error getting all transactions:", error);
    throw new Error(error.message);
  }
};

export { addTransaction, getTransaction, getAllTransactions };
