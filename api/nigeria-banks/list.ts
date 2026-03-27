const PRIMARY_BANKS_URL = "https://nubapi.com/bank-json";
const FALLBACK_BANKS_URL =
  "https://gist.githubusercontent.com/donejeh/5dd73ca4e2c8c94527219af52a5f53b8/raw/bdf5c0511f1fa7b188d633df456534f6a40528b4/banklist.json";

const parseBanks = (payload: unknown) => {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] } | null)?.data)
      ? ((payload as { data: unknown[] }).data ?? [])
      : [];

  return source
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const raw = entry as Record<string, unknown>;
      const name =
        typeof raw.name === "string"
          ? raw.name.trim()
          : typeof raw.bankName === "string"
            ? raw.bankName.trim()
            : typeof raw.Bank_name === "string"
              ? raw.Bank_name.trim()
              : "";
      const code =
        typeof raw.code === "string"
          ? raw.code.trim()
          : typeof raw.bankCode === "string"
            ? raw.bankCode.trim()
            : "";

      if (!name || !code) {
        return null;
      }

      return { name, code };
    })
    .filter((entry): entry is { name: string; code: string } => Boolean(entry))
    .sort((left, right) => left.name.localeCompare(right.name));
};

const fetchBanksFrom = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Bank list request failed with ${response.status}`);
  }

  const payload = await response.json();
  const banks = parseBanks(payload);

  if (banks.length === 0) {
    throw new Error("Bank list response was empty.");
  }

  return banks;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    let banks;

    try {
      banks = await fetchBanksFrom(PRIMARY_BANKS_URL);
    } catch (primaryError) {
      console.warn("Primary bank list lookup failed, using fallback.", primaryError);
      banks = await fetchBanksFrom(FALLBACK_BANKS_URL);
    }

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({ banks });
  } catch (error) {
    console.error("Nigeria bank list error:", error);
    res.status(500).json({ message: "Unable to load Nigerian banks right now." });
  }
}
