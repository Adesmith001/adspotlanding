export interface NigeriaBank {
  name: string;
  code: string;
}

export interface VerifiedNigeriaBankAccount {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  firstName?: string;
  lastName?: string;
  otherName?: string;
}

const normalizeBankName = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const parseBanksPayload = (payload: unknown): NigeriaBank[] => {
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
      const code =
        typeof raw.code === "string"
          ? raw.code.trim()
          : typeof raw.bankCode === "string"
            ? raw.bankCode.trim()
            : "";
      const name = normalizeBankName(raw.name || raw.bankName || raw.Bank_name);

      if (!name || !code) {
        return null;
      }

      return { name, code };
    })
    .filter((entry): entry is NigeriaBank => Boolean(entry))
    .sort((left, right) => left.name.localeCompare(right.name));
};

export const getNigeriaBanks = async (): Promise<NigeriaBank[]> => {
  const response = await fetch("/api/nigeria-banks/list");
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load banks.");
  }

  return parseBanksPayload(payload?.banks || payload?.data || payload);
};

export const verifyNigeriaBankAccount = async (params: {
  accountNumber: string;
  bankCode: string;
}): Promise<VerifiedNigeriaBankAccount> => {
  const search = new URLSearchParams({
    accountNumber: params.accountNumber,
    bankCode: params.bankCode,
  });
  const response = await fetch(`/api/nigeria-banks/verify?${search.toString()}`);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to verify account.");
  }

  const data = payload?.data || payload;
  const accountName = normalizeBankName(data?.accountName || data?.account_name);
  const bankName = normalizeBankName(data?.bankName || data?.Bank_name);
  const bankCode =
    typeof (data?.bankCode || data?.bank_code) === "string"
      ? (data.bankCode || data.bank_code).trim()
      : params.bankCode;
  const accountNumber =
    typeof (data?.accountNumber || data?.account_number) === "string"
      ? (data.accountNumber || data.account_number).trim()
      : params.accountNumber;

  if (!accountName || !bankName || !bankCode || !accountNumber) {
    throw new Error("Bank verification returned incomplete account details.");
  }

  return {
    accountName,
    accountNumber,
    bankCode,
    bankName,
    ...(typeof data?.first_name === "string"
      ? { firstName: data.first_name.trim() }
      : {}),
    ...(typeof data?.last_name === "string"
      ? { lastName: data.last_name.trim() }
      : {}),
    ...(typeof data?.other_name === "string"
      ? { otherName: data.other_name.trim() }
      : {}),
  };
};
