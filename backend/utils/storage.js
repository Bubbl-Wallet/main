import axios from "axios";

const API_BASE_URL = "https://akave.melra.ai";

const addTransaction = async (walletAddress, transaction) => {
  try {
    const bucketID = walletAddress;

    const headers = {
      "Content-Type": "multipart/form-data",
    };

    const file = new FormData();

    const blob = new Blob([JSON.stringify(transaction)], {
      type: "application/json",
    });

    file.append("file", blob, `${transaction.id}.json`);

    const res = await axios.post(
      `${API_BASE_URL}/buckets/${bucketID}/files`,
      file,
      { headers }
    );

    return res.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getTransaction = async (walletAddress, transactionId) => {
  try {
    const bucketId = walletAddress;

    const headers = {
      responseType: "blob",
    };

    const res = await axios.get(
      `${API_BASE_URL}/buckets/${bucketId}/files/${transactionId}.json/download`,
      headers
    );

    return JSON.parse(res.data);
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllTransactions = async (walletAddress) => {
  try {
    const bucketId = walletAddress;

    const res = await axios.get(`${API_BASE_URL}/buckets/${bucketId}/files`);

    return res.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export { addTransaction, getTransaction, getAllTransactions };
