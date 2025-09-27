import axios from "axios";

export const getConversion = async (req, res) => {
  try {
    const { convert_id, id } = req.query;

    if (!convert_id || !id) {
      return res.json({
        status: {
          error_code: "401",
        },
      });
    }

    const response = await axios.get(
      `https://api.coinmarketcap.com/data-api/v3/tools/price-conversion?amount=1&convert_id=${convert_id}&id=${id}`
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.json({
      status: {
        error_code: "401",
      },
    });
  }
};
