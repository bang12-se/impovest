export function getApiUrl(endpoint: string): string {
  const isLocalOrRun =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("run.app"));

  const baseUrl = isLocalOrRun
    ? ""
    : "https://ais-pre-tryxdzgy6sbmnb6ucvhsha-185381729394.asia-northeast1.run.app";

  return `${baseUrl}${endpoint}`;
}
