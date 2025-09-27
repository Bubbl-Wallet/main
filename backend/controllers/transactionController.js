import {
  addTransaction as add,
  getAllTransactions as getAll,
  getTransaction as get,
} from "../utils/storage.js";

const addTransaction = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { transaction } = req.body;

    const data = await add(walletAddress, transaction);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const data = await getAll(walletAddress);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTransaction = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { transactionId } = req.params;

    const data = await get(walletAddress, transactionId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { addTransaction, getAllTransactions, getTransaction };
