import axios from "axios";

export async function getFromIpfs(hash: string): Promise<any> {
  let url: string;
  if (hash.startsWith("Qm")) {
    // V0 IPFS hash (will redirect to correct V1 hash on .ipfs.dweb.link)
    url = `https://w3s.link/ipfs/${hash}`;
  } else {
    // V1 IPFS hash
    url = `https://${hash}.ipfs.w3s.link/`;
  }

  const res = await axios.get(url);
  return res.data;
}
