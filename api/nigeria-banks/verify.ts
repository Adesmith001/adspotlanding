const NUBAPI_VERIFY_URL = "https://nubapi.com/api/verify";

const getBearerToken = () =>
  process.env.NUBAPI_BEARER_TOKEN ||
  process.env.NUBAPI_API_KEY ||
  process.env.VITE_NUBAPI_BEARER_TOKEN ||
  process.env.VITE_NUBAPI_API_KEY;

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const bearerToken = getBearerToken();
  if (!bearerToken) {
    res
      .status(500)
      .json({ message: "NubAPI bearer token is not configured." });
    return;
  }

  const accountNumber =
    typeof req.query?.accountNumber === "string"
      ? req.query.accountNumber.replace(/\D/g, "")
      : "";
  const bankCode =
    typeof req.query?.bankCode === "string" ? req.query.bankCode.trim() : "";

  if (accountNumber.length !== 10 || !bankCode) {
    res
      .status(400)
      .json({ message: "A valid 10-digit account number and bank code are required." });
    return;
  }

  try {
    const search = new URLSearchParams({
      account_number: accountNumber,
      bank_code: bankCode,
    });

    const response = await fetch(`${NUBAPI_VERIFY_URL}?${search.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        Accept: "application/json",
      },
    });

    const payload = await response.json().catch(() => ({}));
    const lookupSucceeded =
      payload?.status === true ||
      payload?.status === "success" ||
      Boolean(payload?.account_name);

    if (!response.ok || !lookupSucceeded) {
      res.status(response.status || 500).json({
        message:
          payload?.message ||
          payload?.error ||
          "Unable to verify this bank account right now.",
      });
      return;
    }

    res.status(200).json({
      data: {
        accountName: payload.account_name || "",
        accountNumber: payload.account_number || accountNumber,
        bankCode: payload.bank_code || bankCode,
        bankName: payload.Bank_name || payload.bank_name || "",
        firstName: payload.first_name || "",
        lastName: payload.last_name || "",
        otherName: payload.other_name || "",
      },
    });
  } catch (error) {
    console.error("Nigeria bank verify error:", error);
    res
      .status(500)
      .json({ message: "Unable to verify this bank account right now." });
  }
}
