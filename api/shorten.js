export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const randomCode = Math.random().toString(36).substring(2, 8);

  return res.status(200).json({
    result_url: `short.ly/${randomCode}`
  });
}